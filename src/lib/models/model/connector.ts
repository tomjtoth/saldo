import pluralize from "pluralize";

import { err } from "@/lib/utils";
import { NumericKeys } from "./types";
import { Inserter } from "./inserter";
import { Model } from "./model";
import { ModelSR } from "./modelSR";
import { ModelSRI } from "./modelSRI";

let tempKey: string | undefined;

const connections: {
  [fromTable: string]: {
    [toTable: string]:
      | {
          fromId: string;
          toId: string;
        }
      | { through: string };
  };
} = {};

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
    const tblA = this.tableName;
    const {
      table: tblB,
      keys,
      through,
    } = other instanceof Model ? other.keysAndTable : other;

    let route: { fromId: string; toId: string } | { through: string };

    if (keys) {
      const thisSingularId = pluralize.singular(tblA) + "Id";
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
          `Could not resolve relation between ${tblA}.${fromId} and ${tblB}.${
            toId ?? "???"
          }`
        );

      route = { fromId, toId };
    } else route = { through: through! };

    if (connections[tblA] === undefined) connections[tblA] = {};
    connections[tblA][tblB] = route;

    console.debug(`RELATION: ${tblA} => ${tblB}:`, route);
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
