import { db } from "@/lib/db";
import { asArray, TMix } from "@/lib/utils";
import { Converter } from "./converter";

export class Inserter<M, C, D> extends Converter<M, C, D> {
  protected get iterColNames() {
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
    const arr = asArray(obj) as (C & { id?: number; revisionId: number })[];

    if (!!revisionId) {
      const id = this.iterColNames.includes("id")
        ? (db
            .prepare(`SELECT COALESCE(MAX(id), 0) + 1 FROM ${this.tableName}`)
            .pluck()
            .get() as number)
        : -1;

      const hasId = id > -1;

      arr.forEach((obj, idx) => {
        obj.revisionId = revisionId;
        if (hasId) obj.id = id + idx;
      });
    }

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
