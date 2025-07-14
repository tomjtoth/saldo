import pluralize from "pluralize";

import { err } from "@/lib/utils";
import { NumericKeys } from "./types";
import { Inserter } from "./inserter";
import { Model } from "./model";
import { ModelSR } from "./modelSR";
import { ModelSRI } from "./modelSRI";

const CONNECTION_TABLE: {
  [fromTable: string]: {
    [toTable: string]:
      | {
          fromId: string;
          toId: string;
        }
      | { through: string };
  };
} = {};

let tempKey: string | undefined;

function connect(...params: string[]): void {
  const [tableA, tableB, ...rest] = params;

  const route =
    rest.length > 1 ? { fromId: rest[0], toId: rest[1] } : { through: rest[0] };

  if (CONNECTION_TABLE[tableA] === undefined) {
    CONNECTION_TABLE[tableA] = { [tableB]: route };
    console.info(`RELATION: ${tableA}.${rest[0]} => ${tableB}.${rest[1]}`);
  } else {
    CONNECTION_TABLE[tableA][tableB] = route;
    console.info(`RELATION: ${tableA} -> ${tableB} via ${rest[0]}`);
  }
}

type TAnyModel = Model<any, any> | ModelSR<any, any> | ModelSRI<any, any>;
type TConnectionHelper = { table: string; keys?: string[]; through?: string };
type TJoin = TAnyModel | TConnectionHelper;

export class Connector<M, C, D> extends Inserter<M, C, D> {
  protected get iterColNames() {
    return this.iterCols.map(([col]) => col as string);
  }

  get keysAndTable() {
    return {
      table: this.tableName,
      keys: this.primaryKeys.length > 1 ? this.iterColNames : this.primaryKeys,
    } as TConnectionHelper;
  }

  column(key: NumericKeys<M>) {
    tempKey = key as string;
    return this;
  }

  /**
   * `.have(...)` `.joinTo(...)` `.joinsTo(...)` are synonyms
   * used during establishing relations between models
   */
  have(other: TJoin) {
    return this.joinsTo(other);
  }

  /**
   * `.have(...)` `.joinTo(...)` `.joinsTo(...)` are synonyms
   * used during establishing relations between models
   */
  joinTo(other: TJoin) {
    return this.joinsTo(other);
  }

  /**
   * `.have(...)` `.joinTo(...)` `.joinsTo(...)` are synonyms
   * used during establishing relations between models
   */
  joinsTo(other: TJoin) {
    const {
      table: otherTableName,
      keys,
      through,
    } = other instanceof Model ? other.keysAndTable : other;

    if (keys) {
      const thisSingularId = pluralize.singular(this.tableName) + "Id";
      // const otherSingularId = pluralize.singular(otherTableName) + "Id";

      const fromId =
        tempKey ??
        // this.iterColNames.find((col) => col === otherSingularId) ??
        (this.primaryKeys[0] as string);

      const toId =
        keys.length > 1
          ? keys.find((key) => key === thisSingularId)
          : keys.at(0);

      if (!toId)
        err(
          `Could not resolve relation between ${
            this.tableName
          }.${fromId} and ${otherTableName}.${toId ?? "???"}`
        );

      connect(this.tableName, otherTableName, fromId, toId);
    } else if (through) connect(this.tableName, otherTableName, through);

    tempKey = undefined;
  }

  via(key: NumericKeys<M>) {
    return {
      table: this.tableName,
      keys: [key as string],
    } as TConnectionHelper;
  }

  through(other: TAnyModel) {
    return {
      table: this.tableName,
      through: other.keysAndTable.table,
    } as TConnectionHelper;
  }
}
