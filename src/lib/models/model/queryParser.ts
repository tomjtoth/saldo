import { TMix } from "@/lib/utils";
import { Connector } from "./connector";
import { Model } from "./model";
import { TValids } from "./types";

export enum Op {
  eq,
  ne,
  between,

  lt,
  le,
  gt,
  ge,

  like,
  iLike,
}

type TOpEq = { [Op.eq]?: number | string | null };
type TOpNe = { [Op.ne]?: number | string | null };
type TOpBetween = { [Op.between]?: [number, number] };

type TOpLt = { [Op.lt]?: number | string };
type TOpLe = { [Op.le]?: number | string };
type TOpGt = { [Op.gt]?: number | string };
type TOpGe = { [Op.ge]?: number | string };

type TOpLike = { [Op.like]?: string };
type TOpILike = { [Op.iLike]?: string };

type TStrOps = TOpEq &
  TOpNe &
  TOpLt &
  TOpLe &
  TOpGt &
  TOpGe &
  TOpLike &
  TOpILike;

type TNumOps = TOpEq & TOpNe & TOpBetween;

type TValObject = {
  [op in Op]?: TVal;
};

type TVal = TMix<number> | TMix<string> | Partial<Record<Op, TValObject>>;

type ExtractD<T> = T extends Model<any, any, infer D> ? D : never;

type TWhere<T> = {
  [P in TSelectKeys<T>]?: T[P] extends number
    ? number | null | TNumOps
    : T[P] extends string
    ? string | null | TStrOps
    : never;
};

export type TQuery<T> = {
  select?: TSelectKeys<T> | TSelectKeys<T>[];
  join?: JoinClause<any>[];
  where?: TWhere<T>;
};

type TSelectKeys<T> = {
  [P in keyof T]: T[P] extends Exclude<TValids, object> ? P : never;
}[keyof T];

type JoinClause<T extends Model<any, any, any>> = {
  table: string;
  select?: TSelectKeys<ExtractD<T>>[];
  where?: TWhere<ExtractD<T>>;
};

export class QueryParser<M, C, D> extends Connector<M, C, D> {
  // sqlFromQuery(query: string | TQuery<D>) {
  //   let stmt: Statement;

  //   if (typeof query === "string") stmt = db.prepare(query);
  //   else {
  //     const sql = `SELECT * FROM ${this.tableName} WHERE ${Object.entries(
  //       query.where
  //     ).map(([key, val]) => `${key} = ${val}`)}`;
  //   }

  //   function recurse(arr, { lop = `and` } = {}) {
  //     if (arr.length == 0) return ``;

  //     let [key, val] = arr.pop();

  //     const col = key;
  //     const op = Array.isArray(val) ? `in` : `=`;
  //     val = Array.isArray(val) ? val : val;

  //     return sql`${lop} (${col} ${op} ${val} ${recurse(arr)})`;
  //   }

  //   function where(crit = {}) {
  //     return sql`where true ${recurse(Object.entries(crit))}`;
  //   }
  // }

  protected parse<T extends { id: number; type: string }>(query: TQuery<T>) {
    const ph = (id: string) => id;

    const stmt = ["SELECT"];

    let columns = "*";

    if (query.select !== undefined && query.select.length > 0)
      columns = query.select.join(", ");

    stmt.push(columns, "FROM", this.tableName);

    let joins = "";

    stmt.push(joins);

    let where = "";

    // Object.entries(query.where);

    // query = {
    //   select: ["id"],
    //   where: {},
    //   join: [
    //     {
    //       table: Memberships,
    //       select: ["userId", ""],
    //       where: {},
    //     },
    //   ],
    // };

    stmt.push(where);

    // `FROM categories c
    //     INNER JOIN groups g on (g.id = c.groupId)
    //     INNER JOIN `;

    return stmt.join(" ");
  }
}
