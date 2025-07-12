import { db } from "../db";
import { asArray, err } from "../utils";

type TMix<T> = T | T[];

type TModelOpts<M, D> = {
  toJS?: (row: D) => M;
  toDB?: (obj: M) => D;
};

type TValidatorFn = (val: unknown) => void;

type TColBase = {
  /**
   * defaults to false
   */
  required?: true;

  /**
   * defaults to false
   */
  allowNull?: true;

  /**
   * setting multiple columns to true results in a compound key
   */
  primaryKey?: true;

  /**
   * when updating only this oclumn of a row, archival will be skipped
   */
  skipArchival?: true;
  validators?: TValidatorFn[];
};

type TypeMap = {
  string: string;
  number: number;
  boolean: boolean;
};

type TModelColumn = {
  [K in keyof TypeMap]: TColBase & {
    type: K;
    defaultValue?: (() => TypeMap[K]) | TypeMap[K];
  };
}[keyof TypeMap];

type TInsertOpts = {
  revisionId?: number;
  upsert?: boolean;
};

export class Model<M, C, D = M> {
  tableName;
  columns;
  skipArchivalOf;
  primaryKeys;

  toDB?(obj: M): D;
  toJS?(row: D): M;

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

    if (toJS) this.toJS = toJS;
    if (toDB) this.toDB = toDB;
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
      return this.toJS ? this.toJS(res as D) : (res as M);
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
      return this.toJS ? (res as D[]).map(this.toJS) : (res as M[]);
    };

    return params.length > 0 ? looper(...params) : looper;
  }

  validate(obj: TMix<C | M>) {
    const arr = asArray(obj);
    const keys = Object.keys(this.columns);

    arr.forEach((row) => {
      keys.forEach((key) => {
        const val = row[key as keyof (C | M)] as unknown;
        const col = this.columns[key as keyof M];
        const schema = `${this.tableName}.${col}`;

        const valType = typeof val;
        if (valType === "undefined") {
          if (col.required) err(`${schema} is required, but undefined`);

          if (col.defaultValue)
            (row[key as keyof (C | M)] as boolean | string | number) =
              typeof col.defaultValue === "function"
                ? col.defaultValue()
                : col.defaultValue;
        }

        if (col.type !== valType && !(col.allowNull && val === null))
          err(`${schema} should be of type ${col.type}, but got a ${valType}`);

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

    const rows = this.toDB ? validated.map(this.toDB) : validated;

    const res = rows.map((obj) => stmt.get(obj));

    return this.toJS ? (res as D[]).map(this.toJS) : (res as M[]);
  }

}

export type TModelSR = {
  revisionId: number;
  statusId: number;
};

export type TCrModelSR = Partial<TModelSR>;

/**
 * statusId and revisionId (as primaryKey) pre-defined
 */
export class ModelSR<
  M extends TModelSR,
  C extends TCrModelSR,
  D extends TModelSR = M
> extends Model<M, C, D> {
  constructor(
    tableName: string,
    columns: { [P in keyof Omit<M, keyof TModelSR>]: TModelColumn },
    opts: TModelOpts<M, D> = {}
  ) {
    super(
      tableName,
      {
        revisionId: {
          type: "number",
          allowNull: false,
          primaryKey: true,
        },
        statusId: {
          type: "number",
          allowNull: false,
          defaultValue: 1,
        },

        ...columns,
      } as { [P in keyof M]: TModelColumn },
      opts
    );
  }

  insert(obj: TMix<C>, opts?: TInsertOpts) {
    let arr = asArray(obj);

    if (!!opts?.revisionId)
      arr.forEach((obj) => (obj.revisionId = opts.revisionId!));

    return super.insert(arr, opts);
  }

  update(updater: Partial<M>, revisionId: number): M {
    return db.transaction(() => {
      const idCrit = this.primaryKeys
        .map((partialKey) => {
          const pk = partialKey as string;
          return `${pk} = :${pk}`;
        })
        .join(" AND ");

      const curr = this.get(
        `SELECT * FROM ${this.tableName} WHERE ${idCrit} AND statusId IN (1, 2)`,
        updater
      );

      if (!curr) err("group does not exist");

      const prev = { ...curr };
      let archiving = false;
      let updating = false;

      Object.entries(updater)
        .filter(
          ([col, val]) =>
            val !== undefined && !this.primaryKeys.includes(col as keyof M)
        )
        .forEach(([col, val]) => {
          if (curr[col as keyof M] != val) {
            if (!this.skipArchivalOf?.includes(col as keyof M))
              archiving = true;

            curr[col as keyof M] = val;
            updating = true;
          }
        });

      if (archiving) {
        db.prepare(
          `UPDATE ${this.tableName} SET statusId = statusId + 2
              WHERE ${idCrit} AND revisionId = :revisionId`
        ).run(prev);
      }

      // TODO: case when only uuid changes is probably not covered so far...
      if (updating) {
        curr.revisionId = revisionId;

        // silencing TS, C is a Partial subset of M,
        // conversion is safe
        this.insert(curr as unknown as C);
      } else err("No changes were made");

      return curr;
    })();
  }
}

export type TModelSRI = TModelSR & {
  id: number;
};

export type TCrModelSRI = TCrModelSR & { id?: number };

/**
 * with statusId, revisionId (as primaryKey)
 * and id (as primaryKey) pre-defined
 */
export class ModelSRI<
  M extends TModelSRI,
  C extends TCrModelSRI,
  D extends TModelSRI = M
> extends ModelSR<M, C, D> {
  constructor(
    tableName: string,
    columns: { [P in keyof Omit<M, keyof TModelSRI>]: TModelColumn },
    opts: TModelOpts<M, D> = {}
  ) {
    super(
      tableName,
      {
        id: {
          type: "number",
          allowNull: false,
          primaryKey: true,
        },

        ...columns,
      } as { [P in keyof Omit<M, keyof TModelSR>]: TModelColumn },
      opts
    );
  }

  insert(obj: TMix<C>, opts?: TInsertOpts) {
    const arr = asArray(obj);

    if (!!opts?.revisionId) {
      const id = db
        .prepare(`SELECT COALESCE(MAX(id), 0) + 1 FROM ${this.tableName}`)
        .pluck()
        .get() as number;

      arr.forEach((obj, idx) => {
        obj.id = id + idx;
      });
    }

    return super.insert(arr, opts);
  }
}
