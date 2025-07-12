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

}

