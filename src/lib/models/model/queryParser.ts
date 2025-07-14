import { TMix } from "@/lib/utils";
import { Connector } from "./connector";
import { Model } from "./model";
import { Memberships } from "../membership";

enum Op {
  eq,
  ne,
  lt,
  le,
  gt,
  ge,
  like,
  iLike,
  between,
}

type TValObject = {
  [op in Op]?: TVal;
};

type TVal = TMix<number> | TMix<string> | Partial<Record<Op, TValObject>>;

type ExtractD<T> = T extends Model<any, any, infer D> ? D : never;

type TWhere<T> = {
  [K in keyof T]: {
    [Op.eq]: number;
  };
};

type TQuery<T> = {
  select?: (keyof T)[];
  join?: JoinClause<any>[];
  where?: TWhere<T>;
};

type JoinClause<T extends Model<any, any, any>> = {
  table: T;
  select?: (keyof T)[];
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
