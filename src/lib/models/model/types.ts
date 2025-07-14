type TValidatorFn = (val: unknown) => void;

type TColBase = {
  /**
   * defaults to false
   */
  required?: true;

  /**
   * defaults to false is this the same as `required = false` ?
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

export type TModelColumn = {
  [K in keyof TypeMap]: TColBase & {
    type: K;
    defaultValue?: (() => TypeMap[K]) | TypeMap[K];
  };
}[keyof TypeMap];

export type TModelOpts<M, D> = {
  toJS?: (fromDB: D) => M;
  toDB?: (fromJS: M) => D;
};

export type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];
