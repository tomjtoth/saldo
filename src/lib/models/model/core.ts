import { TDbValids, TValids } from "./types";

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
  validators?: ((val: unknown) => void)[];

  toJS?: (fromDB: TDbValids) => TValids;
  toDB?: (fromJS: TValids) => TDbValids;
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

export class Core<M> {
  protected tableName;
  protected columns;
  protected skipArchivalOf;
  protected primaryKeys;

  constructor(tableName: string, columns: { [P in keyof M]: TModelColumn }) {
    this.tableName = tableName;
    this.columns = columns;

    this.primaryKeys = this.iterCols
      .filter(([, val]) => !!val.primaryKey)
      .map(([key]) => {
        columns[key].required = true;
        return key;
      });

    this.skipArchivalOf = this.iterCols
      .filter(([, val]) => !!val.skipArchival)
      .map(([key]) => key);
  }

  protected get iterCols() {
    return Object.entries(this.columns) as [keyof M, TModelColumn][];
  }
}
