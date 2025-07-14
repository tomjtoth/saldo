import { err } from "@/lib/utils";
import { Inserter } from "./inserter";
import { Model } from "./model";
import { NumericKeys } from "./types";
import { ModelSR } from "./modelSR";
import { ModelSRI } from "./modelSRI";

type TJoin =
  | { table: string; key: string }
  | Model<any, any>
  | ModelSR<any, any>
  | ModelSRI<any, any>;

export class Connector<M, C, D> extends Inserter<M, C, D> {
  protected tmpKey?: string;
  protected connections: {
    [tableName: string]: { myKey: string; key: string };
  } = {};

  get pkAndTableName() {
    const len = this.primaryKeys.length;
    if (len > 1)
      err(
        `${this.tableName} has ${len} primaryKeys, use its ".via(key)" method to pick one`
      );

    return { table: this.tableName, key: this.primaryKeys[0] as string };
  }

  column(key: NumericKeys<M>) {
    this.tmpKey = key as string;
    return this;
  }

  have(other: TJoin) {
    return this.joinsTo(other);
  }

  joinTo(other: TJoin) {
    return this.joinsTo(other);
  }

  joinsTo(other: TJoin) {
    const { table, key } =
      other instanceof Model ? other.pkAndTableName : other;

    const len = this.primaryKeys.length;
    if (!this.tmpKey && len > 1)
      err(
        `${this.tableName} has ${len} primaryKeys, use its ".column(key)" method to pick one`
      );

    this.connections[table] = {
      myKey: this.tmpKey ?? (this.primaryKeys[0] as string),
      key,
    };
    this.tmpKey = undefined;
  }

  via(key: NumericKeys<M>) {
    return { table: this.tableName, key: key as string };
  }

  // TODO
  through(other: TJoin) {
    return { table: "", key: "" };
  }
}
