import { TModelColumn } from "./types";

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
