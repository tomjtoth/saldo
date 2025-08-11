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
type TModelWithRelations<TTableName extends keyof TSchema> = InferSelectModel<
  Schema[TTableName]
> & {
  [K in keyof TSchema[TTableName]["relations"]]?: TSchema[TTableName]["relations"][K] extends infer TRelation // Infer the Relation/Many type
    ? TRelation extends { referencedTableName: infer TRefDbName extends string }
      ? FindTsNameByDbName<TRefDbName> extends infer TRefTsName extends keyof TSchema
        ? TRelation extends Many<any>
          ? TModelWithRelations<TRefTsName>[]
          : TModelWithRelations<TRefTsName> | null
        : never // Could not find a tsName for the given dbName
      : never // Could not extract referencedTableName (dbName)
    : never; // Could not infer TRelation
};

type WithArchives<T> = Partial<
  T & {
    archives: T[];
  }
>;

export type TRevision = Partial<TModelWithRelations<"revisions">>;
export type TUser = WithArchives<TModelWithRelations<"users">>;
export type TGroup = WithArchives<TModelWithRelations<"groups">>;
export type TMembership = WithArchives<TModelWithRelations<"memberships">>;
export type TCategory = WithArchives<TModelWithRelations<"categories">>;
export type TReceipt = WithArchives<TModelWithRelations<"receipts">>;
export type TItem = WithArchives<TModelWithRelations<"items">>;
export type TItemShare = WithArchives<TModelWithRelations<"itemShares">>;
