import { db } from "@/lib/db";
import { QueryParser, TQuery } from "./queryParser";

export class QueryWrapper<M, C, D> extends QueryParser<M, C, D> {
  protected get pkReplInWhereClause() {
    return (this.primaryKeys as string[])
      .map((pk) => `${pk} = :${pk}`)
      .join(" AND ");
  }

  /**
   * returns a looper
   */
  get archives() {
    const originId = db
      .prepare("SELECT id FROM origins WHERE origin = ?")
      .pluck()
      .get() as number | null;

    return this.all(
      `SELECT a.revisionId, a.payload FROM archives a
        INNER JOIN revisions r ON (r.id = a.revisionId) 
        WHERE originId = ${originId} AND ${this.pkReplInWhereClause}
        ORDER BY r.revisedOn DESC`
    );
  }

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
    const sql = typeof query === "string" ? query : this.parseQuery(query);
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
    const sql = typeof query === "string" ? query : this.parseQuery(query);
    const stmt = db.prepare(sql);

    const looper = (...params: unknown[]) => {
      const res = stmt.all(...params);
      return this.toJS(res as D[]) as (M & T)[];
    };

    return params.length > 0 ? looper(...params) : looper;
  }
}
