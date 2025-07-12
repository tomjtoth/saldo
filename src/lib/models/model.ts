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

export class Model<M, D = M> {
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

  validate(obj: TMix<M>) {
    const arr = asArray(obj);
    const keys = Object.keys(this.columns) as (keyof M)[];

    arr.forEach((row) => {
      keys.forEach((key) => {
        const val = row[key] as unknown;
        const col = this.columns[key];
        const schema = `${this.tableName}.${col}`;

        const valType = typeof val;
        if (valType === "undefined") {
          if (col.required) err(`${schema} is required, but undefined`);

          if (col.defaultValue)
            (row[key] as boolean | string | number) =
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

    return arr;
  }

  insert(
    obj: TMix<D>,
    {
      upsert = false,
    }: {
      upsert?: boolean;
    } = {}
  ) {
    const arr = asArray(obj);

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

    return arr.map((obj) => stmt.get(obj));
  }
}

export type TModelColumnSR = {
  revisionId: number;
  statusId: number;
};

/**
 * statusId and revisionId (as primaryKey) pre-defined
 */
export class ModelSR<
  M extends TModelColumnSR,
  D extends TModelColumnSR = M
> extends Model<M, D> {
  constructor(
    tableName: string,
    columns: { [P in keyof Omit<M, keyof TModelColumnSR>]: TModelColumn },
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

  insert(obj: TMix<D | M>, opts: TInsertOpts = {}) {
    const arr = asArray(obj);
    const notImportingV3 = !!opts.revisionId;

    if (notImportingV3)
      arr.forEach((obj) => (obj.revisionId = opts.revisionId!));

    this.validate(arr as M[]);

    return super.insert(arr as D[], opts);
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
        this.insert(curr);
      } else err("No changes were made");

      return curr;
    })();
  }
}

export type TModelColumnSRI = TModelColumnSR & {
  id: number;
};

/**
 * with statusId, revisionId (as primaryKey)
 * and id (as primaryKey) pre-defined
 */
export class ModelSRI<
  M extends TModelColumnSRI,
  D extends TModelColumnSRI = M
> extends ModelSR<M, D> {
  constructor(
    tableName: string,
    columns: { [P in keyof Omit<M, keyof TModelColumnSRI>]: TModelColumn },
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
      } as { [P in keyof Omit<M, keyof TModelColumnSR>]: TModelColumn },
      opts
    );
  }

  insert(obj: TMix<D | Omit<M, "id">>, opts: TInsertOpts = {}) {
    const arr = asArray(obj as TMix<Omit<M, "id">>);
    const notImportingV3 = !!opts.revisionId;

    if (notImportingV3) {
      const id = db
        .prepare(`SELECT COALESCE(MAX(id), 0) + 1 FROM ${this.tableName}`)
        .pluck()
        .get() as number;

      (arr as M[]).forEach((obj, idx) => {
        obj.id = id + idx;
      });
    }

    return super.insert(arr as M[], opts);
  }
}
