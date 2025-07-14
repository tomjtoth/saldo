import { db } from "@/lib/db";
import { asArray, TMix } from "@/lib/utils";
import { TModelColumn, TModelOpts } from "./types";
import { ModelSR, TCrModelSR, TModelSR } from "./modelSR";
import { TInsertOpts } from "./inserter";

export type TModelSRI = TModelSR & {
  id: number;
};

export type TCrModelSRI = TCrModelSR & { id?: number };

/**
 * with statusId, revisionId (as primaryKey)
 * and id (as primaryKey) pre-defined
 */
export class ModelSRI<
  M extends TModelSRI,
  C extends TCrModelSRI,
  D extends TModelSRI = M
> extends ModelSR<M, C, D> {
  constructor(
    tableName: string,
    columns: { [P in keyof Omit<M, keyof TModelSRI>]: TModelColumn },
    opts: TModelOpts<M, D> = {}
  ) {
    super(
      tableName,
      {
        id: {
          type: "number",
          primaryKey: true,
        },

        ...columns,
      } as { [P in keyof Omit<M, keyof TModelSR>]: TModelColumn },
      opts
    );
  }

  insert(obj: TMix<C>, opts?: TInsertOpts) {
    const arr = asArray(obj);

    if (!!opts?.revisionId) {
      const id = db
        .prepare(`SELECT COALESCE(MAX(id), 0) + 1 FROM ${this.tableName}`)
        .pluck()
        .get() as number;

      arr.forEach((obj, idx) => {
        obj.id = id + idx;
      });
    }

    return super.insert(arr, opts);
  }
}
