import type {
  ExtractTablesWithRelations,
  Many,
  InferSelectModel,
} from "drizzle-orm";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ResultSet } from "@libsql/client";

import * as schema from "./schema";

export type Schema = typeof schema;
export type SchemaTables = ExtractTablesWithRelations<Schema>;

// Helper type to find the tsName corresponding to a given dbName in TSchema
type FindTsNameByDbName<DbNameToFind extends string> = {
  [K in keyof SchemaTables]: SchemaTables[K] extends { dbName: DbNameToFind }
    ? K
    : never;
}[keyof SchemaTables];

/**
 * Utility type to infer the model type for a given table name from the schema.
 * Handles nested relations recursively.
 * Uses referencedTableName (dbName) and FindTsNameByDbName helper.
 */
type TModelWithRelations<TTableName extends keyof SchemaTables> = Partial<
  InferSelectModel<Schema[TTableName]> &
    (TTableName extends "users" ? { color?: string } : object) &
    (TTableName extends "revisions" | "archive"
      ? object
      : { archives: TModelWithRelations<TTableName>[] }) &
    (TTableName extends "groups"
      ? { consumption: TConsumptionChartData; balance: TBalanceChartData }
      : object) & {
      [K in keyof SchemaTables[TTableName]["relations"]]?: SchemaTables[TTableName]["relations"][K] extends infer TRelation // Infer the Relation/Many type
        ? TRelation extends {
            referencedTableName: infer TRefDbName extends string;
          }
          ? FindTsNameByDbName<TRefDbName> extends infer TRefTsName extends keyof SchemaTables
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              TRelation extends Many<any>
              ? TModelWithRelations<TRefTsName>[]
              : TModelWithRelations<TRefTsName> | null
            : never // Could not find a tsName for the given dbName
          : never // Could not extract referencedTableName (dbName)
        : never; // Could not infer TRelation
    }
>;

export type DrizzleTx = SQLiteTransaction<
  "async",
  ResultSet,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

export type TConsumptionChartData = {
  users: TUserChartData[];
  categories: ({
    category: string;
  } & {
    [user: string]: number;
  })[];
};

export type TBalanceChartData = {
  users: TUserChartData[];
  relations: string[];
  data: {
    date: number;
    min: number;
    max: number;
    [relation: string]: number;
  }[];
};

export type TUserChartData = Pick<TUser, "id" | "name" | "color">;

export type CrRevision = typeof schema.revisions.$inferInsert;
export type CrUser = typeof schema.users.$inferInsert;
export type CrGroup = typeof schema.groups.$inferInsert;
export type CrMembership = typeof schema.memberships.$inferInsert;
export type CrCategory = typeof schema.categories.$inferInsert;
export type CrReceipt = typeof schema.receipts.$inferInsert;
export type CrItem = typeof schema.items.$inferInsert;
export type CrItemShare = typeof schema.itemShares.$inferInsert;

export type TSelRevision = typeof schema.revisions.$inferSelect;
export type TSelUser = typeof schema.users.$inferSelect;
export type TSelGroup = typeof schema.groups.$inferSelect;
export type TSelMembership = typeof schema.memberships.$inferSelect;
export type TSelCategory = typeof schema.categories.$inferSelect;
export type TSelReceipt = typeof schema.receipts.$inferSelect;
export type TSelItem = typeof schema.items.$inferSelect;
export type TSelItemShare = typeof schema.itemShares.$inferSelect;

export type RevisionInfo = {
  revision: Pick<TSelRevision, "createdAt"> & {
    createdBy: Pick<TSelUser, "id" | "name" | "image">;
  };
};

export type TRevision = TModelWithRelations<"revisions">;
export type TUser = TModelWithRelations<"users">;
export type TGroup = TModelWithRelations<"groups">;
export type TMembership = TModelWithRelations<"memberships">;
export type TCategory = TModelWithRelations<"categories">;
export type TReceipt = TModelWithRelations<"receipts">;
export type TItem = TModelWithRelations<"items">;
export type TItemShare = TModelWithRelations<"itemShares">;
