import { TOther, TQuery, TSelectKeys, TValids, TWhere } from "./types";

import { QueryWrapper } from "./queryWrapper";
import { connections } from "./connector";

const sql = (val: TValids) =>
  typeof val === "string" ? `'${val!.replaceAll("'", "''")}'` : val;

export class QueryBuilder<M, D> {
  query: TQuery<D>;
  model: QueryWrapper<M, any, D>;

  constructor(model: QueryWrapper<M, any, D>, query?: TQuery<D>) {
    this.model = model;
    this.query = query ?? {};
  }

  select(...columns: TSelectKeys<D>[]) {
    this.query.select = columns;
    return this;
  }

  where(criteria: TWhere<D>) {
    this.query.where = criteria;
    return this;
  }

  private join(other: TOther, inner?: true) {
    if (!this.query.join) this.query.join = [];

    const othersQuery = other.flushQuery();

    if (inner) othersQuery.required = true;

    this.query.join.push(othersQuery);

    return this;
  }

  innerJoin(other: TOther) {
    return this.join(other, true);
  }

  leftJoin(other: TOther) {
    return this.join(other);
  }

  flushQuery() {
    return { ...this.model.flushQuery(), ...this.query } as TQuery<D>;
  }

  get(): (...params: unknown[]) => M | null;
  get(...params: unknown[]): M | null;
  get(...params: unknown[]): (M | null) | ((...params: unknown[]) => M | null) {
    const sql = this.parseQuery();
    return this.model.get(sql, ...params);
  }

  all(): (...params: unknown[]) => M[];
  all(...params: unknown[]): M[];
  all(...params: unknown[]): M[] | ((...params: unknown[]) => M[]) {
    const sql = this.parseQuery();
    return this.model.all(sql, ...params);
  }

  private parseQuery() {
    const columns: string[] = [];
    const joinClause: string[] = [];
    const whereClause: string[] = [];

    function resolveWhereClause(alias: string, where?: TWhere<TOther | D>) {
      const clause: string[] = [];

      function recurseWhere(where: TWhere<TOther | D>) {
        (Object.entries(where) as [string, TWhere<TOther>][]).forEach(
          ([keyOrOR, valOrObj]) => {
            if (keyOrOR === "OR") {
              (valOrObj as TWhere<TOther | D>[]).forEach((obj) => {
                clause.push("OR (");
                recurseWhere(obj);
                clause.push(")");
              });
            } else {
              const valT = typeof valOrObj;
              const col = `"${alias}".${keyOrOR}`;

              if (valOrObj === null) {
                clause.push(`${col} IS NULL`);
              } else if (valT === "function") {
                clause.push(`${col} = ${(valOrObj as Function)()}`);
              } else if (valT === "string") {
                clause.push(`${col} = '${valOrObj}'`);
              } else if (valT === "number" || valT === "bigint") {
                clause.push(`${col} = '${valOrObj}'`);
              } else if (valT === "object") {
                Object.entries(valOrObj).map(([key, val]) => {
                  const operators = {
                    EQ: "=",
                    NE: "!=",
                    LT: "<",
                    LE: "<=",
                    GT: ">",
                    GE: ">=",
                    IN: "IN",
                  };
                  switch (key) {
                    case "EQ":
                      clause.push(`${key} = ${sql(val)}`);

                    default:
                  }
                });
              }
            }
          }
        );
      }

      if (where) recurseWhere(where);

      return clause.join(" AND ");
    }

    function recurseQuery(
      query: TQuery<TOther | D>[],
      parentTable: string,
      parentAlias: string = parentTable
    ) {
      query.forEach(({ table, select, join, required, where }) => {
        const alias = table ? `${parentAlias}.${table}` : parentAlias;

        select?.forEach((col) =>
          columns.push(
            !!table
              ? `"${alias}".${col} AS "${alias}.${col}"`
              : `"${alias}".${col}`
          )
        );

        if (table) {
          const relation = connections[parentTable][table];

          let connStr = "";
          if ("fromId" in relation) {
            connStr = `"${parentAlias}".${relation.fromId} = "${alias}".${relation.toId}`;
          }

          const joinCrit = resolveWhereClause(alias, where);

          joinClause.push(
            required ? "INNER" : "LEFT",
            "JOIN",
            table,
            `AS "${alias}"`,
            "ON",
            "(",
            connStr,
            ...(joinCrit.length > 0 ? ["AND", joinCrit] : []),
            ")"
          );
        } else {
          const whereCrit = resolveWhereClause(alias, where);
          joinClause.push("FROM", parentAlias);
          if (whereCrit.length > 0) whereClause.push("WHERE", whereCrit);
        }

        if (join) recurseQuery(join, table ?? parentTable, alias);
      });
    }

    recurseQuery(
      [this.query as TQuery<TOther | D>],
      this.model.flushQuery().table!
    );

    return [
      "SELECT",
      ...(columns.length > 0 ? [columns.join(", ")] : ["*"]),
      ...joinClause,
      ...(whereClause.length > 0 ? [whereClause] : []),
    ].join(" ");
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
}
