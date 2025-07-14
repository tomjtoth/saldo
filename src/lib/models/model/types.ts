type TValidatorFn = (val: unknown) => void;

export type TDbValids = number | string | null;
export type TValids = TDbValids | boolean | object;

type TColBase = {
  /**
   * defaults to false
   */
  required?: true;

  /**
   * setting multiple columns to true results in a compound key
   */
  primaryKey?: true;

  /**
   * when updating only this oclumn of a row, archival will be skipped
   */
  skipArchival?: true;
  validators?: TValidatorFn[];

  toJS?: (fromDB: TDbValids) => TValids;
  toDB?: (fromJS: TValids) => TDbValids;
};

type TypeMap = {
  string: string;
  number: number;
  boolean: boolean;
};

export type TModelColumn = {
  [K in keyof TypeMap]: TColBase & {
    type: K;
    defaultValue?: (() => TypeMap[K]) | TypeMap[K];
  };
}[keyof TypeMap];

export type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];
