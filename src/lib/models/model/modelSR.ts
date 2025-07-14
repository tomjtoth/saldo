import { db } from "@/lib/db";
import { asArray, err, TMix } from "@/lib/utils";
import { TModelColumn } from "./types";
import { Model } from "./model";
import { TInsertOpts } from "./inserter";

export type TModelSR = {
  revisionId: number;
  statusId: number;
};

export type TCrModelSR = Partial<TModelSR>;

/**
 * statusId and revisionId pre-defined
 */
export class ModelSR<
  M extends TModelSR,
  C extends TCrModelSR,
  D extends TModelSR = M
> extends Model<M, C, D> {
  constructor(
    tableName: string,
    columns: { [P in keyof Omit<M, keyof TModelSR>]: TModelColumn }
  ) {
    super(tableName, {
      revisionId: {
        type: "number",
        reqiured: true,
      },
      statusId: {
        type: "number",
        defaultValue: 1,
      },

      ...columns,
    } as { [P in keyof M]: TModelColumn });
  }

  protected get pkReplInWhereClause() {
    return (this.primaryKeys as string[])
      .map((pk) => `${pk} = :${pk}`)
      .join(" AND ");
  }

  /**
   * returns a looper
   */
  get archives() {
    const originId = db
      .prepare("SELECT id FROM origins WHERE origin = ?")
      .pluck()
      .get() as number | null;

    return this.all(
      `SELECT a.revisionId, a.payload FROM archives a
      INNER JOIN revisions r ON (r.id = a.revisionId) 
      WHERE originId = ${originId} AND ${this.pkReplInWhereClause}
      ORDER BY r.revisedOn DESC`
    );
  }

  update(updater: Partial<M>, revisionId: number): M {
    return db.transaction(() => {
      const curr = this.get(
        `SELECT * FROM ${this.tableName} WHERE ${this.pkReplInWhereClause}`,
        updater
      );

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

            curr[keyM] = nextVal;
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
          SELECT ?, ?, ${pkRepl}, JSONB_OBJECT(${valRepl});`
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

  insert(obj: TMix<C>, opts?: TInsertOpts) {
    let arr = asArray(obj);

    if (!!opts?.revisionId)
      arr.forEach((obj) => (obj.revisionId = opts.revisionId!));

    return super.insert(arr, opts);
  }
}
