import { db } from "@/lib/db";
import { TOther, TQuery, TSelectKeys, TWhere } from "./types";
import { Connector } from "./connector";
import { QueryBuilder } from "./queryBuilder";

export class QueryWrapper<M, C, D> extends Connector<M, C, D> {
  select(...columns: TSelectKeys<D>[]) {
    return new QueryBuilder(this, { select: columns });
  }

  where(criteria: TWhere<D>) {
    return new QueryBuilder(this, { where: criteria });
  }

  flushQuery(): TQuery<D> {
    return { table: this.tableName };
  }

  innerJoin(other: TOther) {
    const builder = new QueryBuilder(this);
    return builder.innerJoin(other);
  }

  leftJoin(other: TOther) {
    const builder = new QueryBuilder(this);
    return builder.leftJoin(other);
  }

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

  get(sql: string): (...params: unknown[]) => M | null;
  get(sql: string, ...params: unknown[]): M | null;

  get(
    sql: string,
    ...params: unknown[]
  ): (M | null) | ((...params: unknown[]) => M | null) {
    const stmt = db.prepare(sql);

    const looper = (...params: unknown[]) => {
      const res = stmt.get(...params);
      if (!res) return null;

      return this.toJS(res as D)[0] as M;
    };

    return params.length > 0 ? looper(...params) : looper;
  }

  all(sql: string): (...params: unknown[]) => M[];
  all(sql: string, ...params: unknown[]): M[];
  all(
    sql: string,
    ...params: unknown[]
  ): M[] | ((...params: unknown[]) => M[]) {
    const stmt = db.prepare(sql);

    const looper = (...params: unknown[]) => {
      const res = stmt.all(...params);
      return this.toJS(res as D[]) as M[];
    };

    return params.length > 0 ? looper(...params) : looper;
  }
}
