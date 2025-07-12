import { db } from "../db";
import { asArray, err } from "../utils";

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
      .map(([key]) => key);

    if (toJS) this.toJS = toJS;
    if (toDB) this.toDB = toDB;
  }

}

