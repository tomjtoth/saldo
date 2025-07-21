import pluralize from "pluralize";

import { err } from "@/lib/utils";
import { Inserter } from "./inserter";
import { Model } from ".";

let tempKey: string | undefined;

type OneToManyRoute = {
  fromId: string;
  toId: string;
  single: boolean;
};

type ManyToManyRoute = { through: string };

export const connections: {
  [fromTable: string]: {
    [toTable: string]: OneToManyRoute | ManyToManyRoute;
  };
} = {};

type NumericKeys<T> = {
  [P in keyof T]: T[P] extends number ? P : never;
}[keyof T];

type AnyModel = Model<any, any, any>;
type ManyToMany = { table: string; through: string };
type OneToMany = { table: string; keys: string[] };
type Joint = AnyModel | OneToMany | ManyToMany;

type ExtractM<T> = T extends Connector<infer M, any, any> ? M : never;

export class Connector<M, C, D> extends Inserter<M, C, D> {
  column(key: Exclude<NumericKeys<M>, "id">) {
    tempKey = key as string;
    return this;
  }

  /**
   * in a `1:1` or `1:M` relation
   * @param single represents the left side
   * @param this represents the right side
   */
  joinTo(single: Joint) {
    this.connect(single, true);
  }

  /**
   * in a `1:1` or `1:M` relation
   * @param single represents the left side
   * @param this represents the right side
   */
  joinsTo(single: Joint) {
    this.connect(single, true);
  }

  private connect(obj: Joint, single: boolean) {
    const tblA = this.tableName;

    let tblB: string;
    let keys: string[];
    let through: string;
    let route: OneToManyRoute | ManyToManyRoute;

    const resolveIds = () => {
      const thisSingularId = pluralize.singular(tblA) + "Id";
      // const otherSingularId = pluralize.singular(otherTableName) + "Id";

      const fromId =
        tempKey ??
        // this.iterColNames.find((col) => col === otherSingularId) ??
        (this.primaryKeys[0] as string);

      const find = (key: string) => keys.find((k) => k === key);

      const toId =
        (single
          ? find("id") ?? find(thisSingularId)
          : find(thisSingularId) ?? find("id")) ?? keys.at(0);

      if (!toId)
        err(
          `Could not resolve relation between ${tblA}.${fromId} and ${tblB}.???`
        );

      route = { fromId, toId, single };
    };

    if (obj instanceof Connector) {
      tblB = obj.tableName;
      keys = obj.iterColNames;

      resolveIds();
    } else if ("keys" in obj) {
      keys = obj.keys;
      tblB = obj.table;

      resolveIds();
    } else if ("through" in obj) {
      tblB = obj.table;
      through = obj.through;

      route = { through, single: false };
    } else return;

    if (connections[tblA] === undefined) connections[tblA] = {};
    connections[tblA][tblB] = route!;

    console.debug(`RELATION: ${tblA} => ${tblB}:`, route!);
    tempKey = undefined;
  }

  /**
   * in a `N:M` relation
   * @param multipleThrough represents the right side
   * @param this represents the left side
   */
  have(multipleThrough: ManyToMany): void;

  /**
   * in a `1:M` relations
   * @param multiple represents the right side
   * @param this represents the left side
   */
  have(multiple: AnyModel | OneToMany): void;
  have(multiple: Joint) {
    this.connect(multiple, false);
  }

  via(column: Exclude<NumericKeys<M>, "id">): OneToMany {
    return {
      table: this.tableName,
      keys: [column as string],
    };
  }

  through(other: AnyModel): ManyToMany {
    return {
      table: this.tableName,
      through: other.tableName,
    };
  }
}
