import { db } from "@/lib/db";
import { asArray, err, TMix } from "@/lib/utils";
import { TModelColumn, TModelOpts } from "./types";
import { Model } from "./model";
import { TInsertOpts } from "./inserter";

export type TModelSR = {
  revisionId: number;
  statusId: number;
};

export type TCrModelSR = Partial<TModelSR>;

/**
 * statusId and revisionId (as primaryKey) pre-defined
 */
export class ModelSR<
  M extends TModelSR,
  C extends TCrModelSR,
  D extends TModelSR = M
> extends Model<M, C, D> {
  constructor(
    tableName: string,
    columns: { [P in keyof Omit<M, keyof TModelSR>]: TModelColumn },
    opts: TModelOpts<M, D> = {}
  ) {
    super(
      tableName,
      {
        revisionId: {
          type: "number",
          reqiured: true,
        },
        statusId: {
          type: "number",
          defaultValue: 1,
        },

        ...columns,
      } as { [P in keyof M]: TModelColumn },
      opts
    );
  }

  protected get idCrit() {
    return this.primaryKeys
      .map((partialKey) => {
        const pk = partialKey as string;
        return `${pk} = :${pk}`;
      })
      .join(" AND ");
  }

  update(updater: Partial<M>, revisionId: number): M {
    return db.transaction(() => {
      const curr = this.get(
        `SELECT * FROM ${this.tableName} WHERE ${this.idCrit}`,
        updater
      );

      if (!curr) err("group does not exist");

      const prev = { ...curr };
      let archiving = false;
      let updating = false;

      Object.entries(updater)
        .filter(
          ([col, val]) =>
            val !== undefined && !this.primaryKeys.includes(col as keyof M)
        )
        .forEach(([col, val]) => {
          if (curr[col as keyof M] != val) {
            if (!this.skipArchivalOf?.includes(col as keyof M))
              archiving = true;

            curr[col as keyof M] = val;
            updating = true;
          }
        });

      if (archiving) {
        db.prepare(
          `UPDATE ${this.tableName} SET statusId = statusId + 2
              WHERE ${this.idCrit} AND revisionId = :revisionId`
        ).run(prev);
      }

      // TODO: case when only uuid changes is probably not covered so far...
      if (updating) {
        curr.revisionId = revisionId;

        // silencing TS, C is a Partial subset of M,
        // conversion is safe
        this.insert(curr as unknown as C);
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
