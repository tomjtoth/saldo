import {
  TLiteral,
  TOther,
  TQuery,
  TSelectKeys,
  TWhere,
  TwoOrMore,
} from "./types";

import { QueryWrapper } from "./queryWrapper";
import { AnyModel, connections } from "./connector";

type OneOrMore<T> = T | TwoOrMore<T>;

const quoted = (val: unknown) =>
  typeof val === "object" && "$SQL" in (val as TLiteral)
    ? (val as TLiteral).$SQL
    : typeof val === "string"
    ? `'${val.replaceAll("'", "''")}'`
    : (val as string | number);

const COMPARISONS = Object.entries({
  $LT: "<",
  $LE: "<=",
  $GE: ">=",
  $GT: ">",
});

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

  /**
   *  same as `through` in `include: [{ model, through: {} }]`
   */
  andFrom(other: TOther) {
    return this;
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
      function recurseWhere(where: TWhere<TOther | D>) {
        const clause: string[] = [];

        const entries = Object.entries(where) as (
          | [keyof AnyModel, TWhere<TOther | D>]
          | ["$EITHER", TWhere<TOther | D>[]]
        )[];

        entries.forEach(([keyOrEither, objOrArr]) => {
          if (keyOrEither === "$EITHER") {
            const inner = objOrArr
              // .map((obj) => `(${recurseWhere(obj)})`)
              .map((obj) => recurseWhere(obj))
              .join(" OR ");

            clause.push(
              entries.length > 1
                ? // additional criterium exists on this level, must wrap in (alt1 OR alt2 OR ... OR altN)
                  `(${inner})`
                : // there's no pre-existing criteria on this level, no need for additional parenths
                  inner
            );
          } else {
            const colName = `"${alias}".${keyOrEither}`;
            const col = (val: string) => clause.push(`${colName} ${val}`);

            function recurseCol(valOrObj: TWhere<TOther | D>, negated = false) {
              Object.entries(
                typeof valOrObj === "object" && valOrObj !== null
                  ? valOrObj
                  : { $EQ: valOrObj }
              ).map(([key, val]) => {
                let compIdx = COMPARISONS.findIndex(
                  ([operator]) => key === operator
                );

                if (val === null)
                  col(`IS ${negated || key === "$NOT" ? "NOT " : ""}NULL`);
                else if (key === "$IN") {
                  col(
                    `${negated ? "NOT " : ""}IN (${val.map(quoted).join(", ")})`
                  );
                } else if (key === "$BETWEEN") {
                  const [lower, upper] = val as
                    | [number | TLiteral, number | TLiteral]
                    | [string | TLiteral, string | TLiteral];

                  col(
                    `${negated ? "NOT " : ""}BETWEEN ${quoted(
                      lower
                    )} AND ${quoted(upper)}`
                  );
                } else if (key === "$LIKE") {
                  col(`${negated ? "NOT " : ""}LIKE ${quoted(val)}`);
                } else if (compIdx > -1) {
                  if (negated) compIdx = (compIdx + 2) % 4;

                  col(`${COMPARISONS[compIdx][1]} ${quoted(val)}`);
                } else if (typeof val === "object" && key !== "$EQ") {
                  recurseCol(val, "$NOT" === key);
                } else {
                  col(
                    `${negated || key === "$NOT" ? "!=" : "="} ${quoted(
                      key === "$SQL" ? { $SQL: val } : val
                    )}`
                  );
                }
              });
            }

            recurseCol(objOrArr);
          }
        });

        return clause.join(" AND ");
      }

      return where ? recurseWhere(where) : "";
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
          // TODO: handle junction table connections
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
      ...whereClause,
    ].join(" ");
  }
}
