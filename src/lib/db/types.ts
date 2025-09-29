import type {
  ExtractTablesWithRelations,
  Many,
  InferSelectModel,
} from "drizzle-orm";
import * as schema from "./schema";

type Schema = typeof schema;
type TSchema = ExtractTablesWithRelations<Schema>;

// Helper type to find the tsName corresponding to a given dbName in TSchema
type FindTsNameByDbName<DbNameToFind extends string> = {
  [K in keyof TSchema]: TSchema[K] extends { dbName: DbNameToFind } ? K : never;
}[keyof TSchema];

/**
 * Utility type to infer the model type for a given table name from the schema.
 * Handles nested relations recursively.
 * Uses referencedTableName (dbName) and FindTsNameByDbName helper.
 */
type TModelWithRelations<TTableName extends keyof TSchema> = Partial<
  InferSelectModel<Schema[TTableName]> &
    (TTableName extends "revisions" | "archive"
      ? object
      : { archives: TModelWithRelations<TTableName>[] }) &
    (TTableName extends "groups"
      ? { pareto: TParetoChartData; balance: TBalanceChartData }
      : object) & {
      [K in keyof TSchema[TTableName]["relations"]]?: TSchema[TTableName]["relations"][K] extends infer TRelation // Infer the Relation/Many type
        ? TRelation extends {
            referencedTableName: infer TRefDbName extends string;
          }
          ? FindTsNameByDbName<TRefDbName> extends infer TRefTsName extends keyof TSchema
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              TRelation extends Many<any>
              ? TModelWithRelations<TRefTsName>[]
              : TModelWithRelations<TRefTsName> | null
            : never // Could not find a tsName for the given dbName
          : never // Could not extract referencedTableName (dbName)
        : never; // Could not infer TRelation
    }
>;

export type TParetoChartData = {
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

export type TUserChartData = {
  id: number;
  name: string;
  chartStyle: string;
};

export type TCrRevision = typeof schema.revisions.$inferInsert;
export type TCrUser = typeof schema.users.$inferInsert;
export type TCrGroup = typeof schema.groups.$inferInsert;
export type TCrMembership = typeof schema.memberships.$inferInsert;
export type TCrCategory = typeof schema.categories.$inferInsert;
export type TCrReceipt = typeof schema.receipts.$inferInsert;
export type TCrItem = typeof schema.items.$inferInsert;
export type TCrItemShare = typeof schema.itemShares.$inferInsert;

export type TRevision = TModelWithRelations<"revisions">;
export type TUser = TModelWithRelations<"users">;
export type TGroup = TModelWithRelations<"groups">;
export type TMembership = TModelWithRelations<"memberships">;
export type TCategory = TModelWithRelations<"categories">;
export type TReceipt = TModelWithRelations<"receipts">;
export type TItem = TModelWithRelations<"items">;
export type TItemShare = TModelWithRelations<"itemShares">;
