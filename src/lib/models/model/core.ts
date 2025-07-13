import { TModelColumn, TModelOpts } from "./types";

export class Core<M, D> {
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

  protected get boolCols() {
    return Object.entries<TModelColumn>(this.columns).filter(
      ([, { type }]) => type === "boolean"
    );
  }
}
