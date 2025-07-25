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

  protected pkReplInWhereClause(forArchives = false) {
    return (this.primaryKeys as string[])
      .map((pk, idx) => `${forArchives ? "entityPk" + (idx + 1) : pk} = :${pk}`)
      .join(" AND ");
  }

  /**
   * returns a looper
   */
  get archives() {
    let tableId = db
      .prepare(
        `SELECT key FROM meta, json_each(data) 
        WHERE info = 'tableNames' AND value = :tableName`
      )
      .pluck()
      .get(this) as number | null;

    if (tableId === null)
      tableId = db
        .prepare(
          `INSERT INTO meta (info, data) VALUES ('tableNames', jsonb_array(:tableName))
          ON CONFLICT DO UPDATE SET data = jsonb_insert(data, '$[#]', :tableName)
          RETURNING json_array_length(data) - 1`
        )
        .pluck()
        .get(this) as number;

    return this.prepare(
      `SELECT a.revisionId, a.payload FROM archives a
        INNER JOIN revisions r ON (r.id = a.revisionId) 
        WHERE tableId = ${tableId} AND ${this.pkReplInWhereClause(true)}
        ORDER BY r.revisedOn DESC`
    ).all;
  }

  count() {
    return db
      .prepare(`SELECT COUNT(*) FROM ${this.tableName};`)
      .pluck()
      .get() as number;
  }

  prepare(sql: string, ...params: unknown[]) {
    const stmt = db.prepare(sql);
    const looperParams = params;

    return {
      get: (...params: unknown[]) => {
        const res = stmt.get(...params.concat(looperParams));
        if (!res) return null;

        const [one] = this.toJS(res as D);
        return one;
      },

      all: (...params: unknown[]) => {
        const res = stmt.all(...params.concat(looperParams));

        return this.toJS(res as D[]);
      },
    };
  }

  get(sql: string, ...params: unknown[]): M | null {
    return this.prepare(sql).get(...params);
  }

  all(sql: string, ...params: unknown[]): M[] {
    return this.prepare(sql).all(...params);
  }
}
