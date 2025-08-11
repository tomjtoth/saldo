import { db } from "@/lib/db";
import { TMix } from "@/lib/types";
import { asArray } from "@/lib/utils";
import { Converter } from "./converter";

export class Inserter<M, C, D> extends Converter<M, C, D> {
  get iterColNames() {
    return this.iterCols.map(([col]) => col as string);
  }

  insert(
    obj: TMix<C>,
    {
      upsert = false,
      revisionId,
    }: {
      revisionId?: number;
      upsert?: boolean;
    } = {}
  ) {
    const arr = asArray(obj) as (C & { revisionId: number })[];

    if (!!revisionId) arr.forEach((obj) => (obj.revisionId = revisionId));

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
