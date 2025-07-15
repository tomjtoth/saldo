import { db } from "@/lib/db";
import { QueryParser, TQuery } from "./queryParser";

export class Model<M, C, D = M> extends QueryParser<M, C, D> {
  count() {
    return db
      .prepare(`SELECT COUNT(*) FROM ${this.tableName};`)
      .pluck()
      .get() as number;
  }

  get(query: string | TQuery<M>): (...params: unknown[]) => M | null;
  get(query: string | TQuery<M>, ...params: unknown[]): M | null;

  get(
    query: string | TQuery<M>,
    ...params: unknown[]
  ): (M | null) | ((...params: unknown[]) => M | null) {
    const sql = typeof query === "string" ? query : this.parse(query);
    const stmt = db.prepare(sql);

    const looper = (...params: unknown[]) => {
      const res = stmt.get(...params);
      if (!res) return null;

      return this.toJS(res as D)[0] as M;
    };

    return params.length > 0 ? looper(...params) : looper;
  }

  all<T = object>(
    query: string | TQuery<M>
  ): (...params: unknown[]) => (M & T)[];
  all<T = object>(query: string | TQuery<M>, ...params: unknown[]): (M & T)[];
  all<T = object>(
    query: string | TQuery<M>,
    ...params: unknown[]
  ): (M & T)[] | ((...params: unknown[]) => (M & T)[]) {
    const sql = typeof query === "string" ? query : this.parse(query);
    const stmt = db.prepare(sql);

    const looper = (...params: unknown[]) => {
      const res = stmt.all(...params);
      return this.toJS(res as D[]) as (M & T)[];
    };

    return params.length > 0 ? looper(...params) : looper;
  }
}
