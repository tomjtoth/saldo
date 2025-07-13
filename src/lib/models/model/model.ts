import { db } from "@/lib/db";
import { Inserter } from "./inserter";

// type TQuery<T> = {
//   where: {
//     [K in keyof T]: number | string | number[] | string[];
//   };
// };

export class Model<M, C, D = M> extends Inserter<M, C, D> {
  protected get idCrit() {
    return this.primaryKeys
      .map((partialKey) => {
        const pk = partialKey as string;
        return `${pk} = :${pk}`;
      })
      .join(" AND ");
  }

  /**
   * returns a looper
   */
  get archives() {
    return this.all(
      `SELECT a.* FROM ${this.tableName}Archive a
      INNER JOIN revisions r ON (r.id = a.revisionId) 
      WHERE ${this.idCrit}
      ORDER BY r.revisedOn DESC`
    );
  }

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

  joinTo() {}

  count() {
    return db
      .prepare(`SELECT COUNT(*) FROM ${this.tableName};`)
      .pluck()
      .get() as number;
  }

  get<T = object>(sql: string): (...params: unknown[]) => (M & T) | null;
  get<T = object>(sql: string, ...params: unknown[]): (M & T) | null;
  get<T = object>(
    sql: string,
    ...params: unknown[]
  ): ((M & T) | null) | ((...params: unknown[]) => (M & T) | null) {
    const stmt = db.prepare(sql);

    const looper = (...params: unknown[]) => {
      const res = stmt.get(...params);
      if (!res) return null;

      return this.toJS(res as D) as M & T;
    };

    return params.length > 0 ? looper(...params) : looper;
  }

  all<T = object>(sql: string): (...params: unknown[]) => (M & T)[];
  all<T = object>(sql: string, ...params: unknown[]): (M & T)[];
  all<T = object>(
    sql: string,
    ...params: unknown[]
  ): (M & T)[] | ((...params: unknown[]) => (M & T)[]) {
    const stmt = db.prepare(sql);

    const looper = (...params: unknown[]) => {
      const res = stmt.all(...params);
      return this.toJS(res as D[]) as (M & T)[];
    };

    return params.length > 0 ? looper(...params) : looper;
  }
}
