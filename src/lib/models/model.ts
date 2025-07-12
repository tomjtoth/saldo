import { db } from "../db";
import { asArray, err } from "../utils";

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

  toDB?(obj: M): D;
  toJS?(row: D): M;

  constructor(
    tableName: string,
    columns: { [P in keyof M]: TModelColumn },
    { toJS, toDB }: TModelOpts<M, D> = {}
  ) {
    this.tableName = tableName;
    this.columns = columns;

    if (toJS) this.toJS = toJS;
    if (toDB) this.toDB = toDB;
  }

}

