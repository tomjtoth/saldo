import { db } from "@/lib/db";
import { asArray, err, TMix } from "@/lib/utils";
import { TInsertOpts, TModelColumn } from "./types";

export type TModelOpts<M, D> = {
  toJS?: (fromDB: D) => M;
  toDB?: (fromJS: M) => D;
};

export class Model<M, C, D = M> {
  protected tableName;
  protected columns;
  protected skipArchivalOf;
  protected primaryKeys;

  protected _toDB?(fromJS: M): D;
  protected _toJS?(fromDB: D): M;

  constructor(
    tableName: string,
    columns: { [P in keyof M]: TModelColumn },
    { toJS, toDB }: TModelOpts<M, D> = {}
  ) {
    this.tableName = tableName;
    this.columns = columns;

    this.primaryKeys = (Object.entries(columns) as [keyof M, TModelColumn][])
      .filter(([, val]) => !!val.primaryKey)
      .map(([key]) => {
        columns[key].required = true;
        return key;
      });

    this.skipArchivalOf = (Object.entries(columns) as [keyof M, TModelColumn][])
      .filter(([, val]) => !!val.skipArchival)
      .map(([key]) => key);

    if (toJS) this._toJS = toJS;
    if (toDB) this._toDB = toDB;
  }

  private get boolCols() {
    return Object.entries<TModelColumn>(this.columns).filter(
      ([, { type }]) => type === "boolean"
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
      return this._toJS ? this._toJS(res as D) : (res as M);
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
      return this._toJS ? (res as D[]).map(this._toJS) : (res as M[]);
    };

    return params.length > 0 ? looper(...params) : looper;
  }

  protected toDB(fromJS: TMix<M>) {
    const arr = asArray(fromJS) as M[] | D[];

    return arr.map((row) => {
      let tmp = row as D | M;

      if (this._toDB) tmp = this._toDB(tmp as M);

      this.boolCols.forEach(([key]) => {
        (tmp[key as keyof (D | M)] as boolean) = (tmp[key as keyof (D | M)]
          ? 1
          : 0) as unknown as boolean;
      });

      return tmp as D;
    });
  }

  protected toJS(fromDB: TMix<D>) {
    const arr = asArray(fromDB) as D[] | M[];

    return arr.map((row) => {
      let tmp = row as D | M;

      if (this._toJS) tmp = this._toJS(tmp as D);

      this.boolCols.forEach(([key]) => {
        const asInt = (tmp[key as keyof (D | M)] ? 1 : 0) as unknown as boolean;

        (tmp[key as keyof (D | M)] as boolean) = asInt;
      });

      return tmp as M;
    });
  }

  protected validate(obj: TMix<C | M>) {
    const arr = asArray(obj);
    const keys = Object.keys(this.columns);

    arr.forEach((row) => {
      keys.forEach((key) => {
        let val = row[key as keyof (C | M)] as unknown;
        const col = this.columns[key as keyof M];
        const schema = `${this.tableName}.${key}`;

        let valType = typeof val;
        if (valType === "undefined") {
          if (col.required) err(`${schema} is required, but undefined`);

          val = (row[key as keyof (C | M)] as
            | boolean
            | string
            | number
            | null) = col.defaultValue
            ? typeof col.defaultValue === "function"
              ? col.defaultValue()
              : col.defaultValue
            : null;

          valType = typeof val;
        }

        if (
          col.type !== valType &&
          !(!col.required && (val === null || val === undefined))
        )
          err(`${schema} should be of type ${col.type}, but got ${valType}`);

        if (col.validators)
          Object.values(col.validators).forEach((validator) => {
            try {
              validator(val);
            } catch (vErr) {
              err(
                `${schema} failed validation of "${validator.name}": ${
                  (vErr as Error).message
                }`
              );
            }
          });
      });
    });

    return arr as M[];
  }

  insert(obj: TMix<C>, { upsert = false }: TInsertOpts = {}) {
    const arr = asArray(obj);

    const validated = this.validate(arr);

    const cols = Object.keys(this.columns);
    const strCols = `(${cols.join(",")})`;
    const strVals = strCols.replaceAll(/(\w+)/g, "@$1");

    const upsertClause = upsert
      ? `ON CONFLICT DO UPDATE SET ${cols
          .filter((col) => !this.primaryKeys.includes(col as keyof M))
          .map((col) => `${col} = :${col}`)
          .join(", ")}`
      : "";

    const stmt = db.prepare(
      `INSERT INTO ${this.tableName} ${strCols} VALUES ${strVals} ${upsertClause} RETURNING *`
    );

    const res = this.toDB(validated).map((obj) => stmt.get(obj)) as D[];

    return this.toJS(res);
  }
}
