import { db } from "@/lib/db";
import { err } from "@/lib/utils";
import { QueryWrapper } from "./queryWrapper";

export class Updater<M, C, D> extends QueryWrapper<M, C, D> {
  update(updater: Partial<M>, revisionId: number): M {
    return db.transaction(() => {
      const curr = this.get(
        `SELECT * FROM ${this.tableName} WHERE ${this.pkReplInWhereClause()}`,
        updater
      ) as M & { revisionId: number };

      if (!curr) err("entity not found");

      const archiver: Partial<M> = {};
      let updating = false;

      Object.entries(updater)
        .filter(
          ([col, val]) =>
            val !== undefined && !this.primaryKeys.includes(col as keyof M)
        )
        .forEach(([col, nextVal]) => {
          const keyM = col as keyof M;
          const currVal = curr[keyM];

          if (currVal != nextVal) {
            this.validateValue(nextVal, col as keyof M);

            if (!this.skipArchivalOf?.includes(keyM)) archiver[keyM] = currVal;

            (curr[keyM] as number | string | boolean) = nextVal as
              | number
              | string
              | boolean;

            updating = true;
          }
        });

      const archiverEntries = Object.entries(archiver);

      if (updating) {
        if (archiverEntries.length > 0) {
          // values of archiver come straight from the DB, no need to validate +1 times...

          // archiverEntries.forEach(([key, val]) =>
          //   // cannot pass this to validate, becase that's expecting a full row, this is only partial
          //   this.validateValue(val, key as keyof M, (val) => {
          //     (archiver[key as keyof M] as TValids) = val;
          //   })
          // );

          const [converted] = this.toDB(archiver as M);

          const pkRepl = this.primaryKeys
            .map((key) => `:${key as string}`)
            .join(", ");

          const pkCols = this.primaryKeys
            .map((_, idx) => `entityPk${idx + 1}`)
            .join(", ");

          const tableId = db
            .prepare(
              `INSERT INTO tableNames (name) SELECT ?
            ON CONFLICT DO UPDATE SET name = name RETURNING id;`
            )
            .pluck()
            .get(this.tableName) as number;

          const valRepl = archiverEntries
            .map(([key]) => `'${key}', :${key}`)
            .join(", ");

          db.prepare(
            `INSERT INTO archives (tableId, revisionId, ${pkCols}, payload) 
            SELECT ?, ?, ${pkRepl}, jsonb_object(${valRepl});`
          ).run(tableId, curr.revisionId, converted);

          // only change the revisionId after archival
          curr.revisionId = revisionId;
        }

        // silencing TS, type C is a Partial subset of M, conversion is safe
        this.insert(curr as unknown as C, { upsert: true });
      } else err("No changes were made");

      return curr;
    })();
  }
}
