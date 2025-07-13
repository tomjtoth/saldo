import { db } from "@/lib/db";
import { asArray, TMix } from "@/lib/utils";
import { Converter } from "./converter";

export type TInsertOpts = {
  revisionId?: number;
  upsert?: boolean;
};

export class Inserter<M, C, D> extends Converter<M, C, D> {
  insert(obj: TMix<C>, { upsert = false }: TInsertOpts = {}) {
    const arr = asArray(obj);

    const validated = this.validate(arr);

    const cols = Object.keys(this.columns);
    const strCols = `(${cols.join(",")})`;
    const strVals = strCols.replaceAll(/(\w+)/g, "@$1");

    const upsertClause = upsert
      ? `ON CONFLICT DO UPDATE SET ${cols
          .filter((col) => !this.primaryKeys.includes(col as keyof M))
          .map((col) => `${col} = :${col}`)
          .join(", ")}`
      : "";

    const stmt = db.prepare(
      `INSERT INTO ${this.tableName} ${strCols} VALUES ${strVals} ${upsertClause} RETURNING *`
    );

    const res = this.toDB(validated).map((obj) => stmt.get(obj)) as D[];

    return this.toJS(res);
  }
}
