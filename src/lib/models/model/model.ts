import { db } from "@/lib/db";
import { QueryParser } from "./queryParser";

export class Model<M, C, D = M> extends QueryParser<M, C, D> {
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
