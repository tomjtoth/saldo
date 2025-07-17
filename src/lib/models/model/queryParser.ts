import { TMix } from "@/lib/utils";
import { Model } from "../model";
import { TValids } from "./types";
import { Connector } from "./connector";

export enum Op {
  not,
  or,

  eq,
  ne,
  between,

  lt,
  le,
  gt,
  ge,
  in,

  like,
}

type TOpNot<T> = { [Op.not]?: TWhere<T>[] };
type TOpOr<T> = { [Op.or]?: TWhere<T>[] };

type TOpEq = { [Op.eq]?: number | string | null };
type TOpNe = { [Op.ne]?: number | string | null };
type TOpBetween = { [Op.between]?: [number, number] };

type TOpLt = { [Op.lt]?: number | string };
type TOpLe = { [Op.le]?: number | string };
type TOpGt = { [Op.gt]?: number | string };
type TOpGe = { [Op.ge]?: number | string };
type TOpIn<T> = { [Op.in]?: T[] };

type TOpLike = { [Op.like]?: string };

type TStrOps = TOpIn<string> &
  TOpEq &
  TOpNe &
  TOpLt &
  TOpLe &
  TOpGt &
  TOpGe &
  TOpLike;

type TNumOps = TOpIn<number> &
  TOpEq &
  TOpNe &
  TOpLt &
  TOpLe &
  TOpGt &
  TOpGe &
  TOpBetween;

type TSelectKeys<T> = {
  [P in keyof T]: T[P] extends Exclude<TValids, object> ? P : never;
}[keyof T];

type TWhere<T> = TOpOr<T> & {
  [P in TSelectKeys<T>]?: T[P] extends number
    ? number | null | TNumOps | TLiteral
    : T[P] extends string
    ? string | null | TStrOps | TLiteral
    : never;
};

export type TQuery<T> = {
  select?: TMix<TSelectKeys<T>>;
  join?: TMix<JoinClause<Model<any, any>>>;
  /**
   * all members of this level are connected by "AND"
   */
  where?: TWhere<T>;
};

type ExtractM<T> = T extends Model<infer M, any> ? M : never;

type JoinClause<T extends Model<any, any>> = {
  table: T;
  select?: TMix<TSelectKeys<ExtractM<T>>>;

  /**
   * all members of this level are connected by "AND"
   */
  where?: TWhere<ExtractM<T>>;
};

type TLiteral = () => string;

/**
 * injects the provided string into the statement
 */
export const literal = (sql: string) => (() => sql) as TLiteral;

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

  protected parse(query: TQuery<M>) {
    const aliases = [this.tableName];

    const ex1 = `SELECT 1 FROM categories c 
      INNER JOIN memberships ms ON (
        ms.groupId = c.groupId AND
        ms.userId = :userId AND
        ms.statusId = 1
      )
      WHERE c.id = :categoryId`;

    const ex2 = `SELECT 
        g.id, g.name, 
        ms.defaultCategoryId AS "memberships.defaultCategoryId"
      FROM groups g
      INNER JOIN memberships ms ON (
        ms.groupId = g.id AND
        ms.userId = :userId AND
        ms.statusId = 1
      )
      WHERE g.statusId = 1
      ORDER BY g.name`;

    const stmt = ["SELECT"];

    let columns = "*";

    if (query.select !== undefined) {
      if (Array.isArray(query.select))
        columns = query.select
          .map((col) => `${aliases[0]}.${col as string}`)
          .join(", ");
      else {
        columns = `${aliases[0]}.${query.select as string}`;
      }
    }

    let from = "";

    let joins = "";

    stmt.push(columns, "FROM", ...[this.tableName, "qwe"]);
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
