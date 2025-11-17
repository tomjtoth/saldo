import type { ExtractTablesWithRelations } from "drizzle-orm";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ResultSet } from "@libsql/client";

import * as schema from "./schema";

export type Schema = typeof schema;
export type SchemaTables = {
  [K in keyof Schema as K extends `${string}Rel` ? never : K]: Schema[K];
};

export type QueryParamsOf<T extends keyof SchemaTables> = Parameters<
  DrizzleTx["query"][T]["findMany"]
>[0];

// nice utility type, but makes my code less readable with
// longer overall names and additional imports..
export type ModelMode = "selectFromDb" | "insertIntoDb" | null;
export type ModelType<
  DefaultType,
  Table extends keyof SchemaTables,
  Mode extends ModelMode
> = Mode extends "selectFromDb"
  ? DbSelect<Table>
  : Mode extends "insertIntoDb"
  ? DbInsert<Table>
  : DefaultType;

export type DbInsert<T extends keyof SchemaTables> = Schema[T]["$inferInsert"];
export type DbSelect<T extends keyof SchemaTables> = Schema[T]["$inferSelect"];

export type DrizzleTx = SQLiteTransaction<
  "async",
  ResultSet,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

export type TConsumptionChartData = {
  categories: ({
    category: string;
  } & {
    [user: string]: number;
  })[];
};

export type TBalanceChartData = {
  relations: string[];
  data: {
    date: number;
    min: number;
    max: number;
    [relation: string]: number;
  }[];
};

export type CrRevision = typeof schema.revisions.$inferInsert;
export type CrUser = typeof schema.users.$inferInsert;
export type CrGroup = typeof schema.groups.$inferInsert;
export type CrMembership = typeof schema.memberships.$inferInsert;
export type CrCategory = typeof schema.categories.$inferInsert;
export type CrReceipt = typeof schema.receipts.$inferInsert;
export type CrItem = typeof schema.items.$inferInsert;
export type CrItemShare = typeof schema.itemShares.$inferInsert;

export type DbRevision = typeof schema.revisions.$inferSelect;
export type DbUser = typeof schema.users.$inferSelect;
export type DbGroup = typeof schema.groups.$inferSelect;
export type DbMembership = typeof schema.memberships.$inferSelect;
export type DbCategory = typeof schema.categories.$inferSelect;
export type DbReceipt = typeof schema.receipts.$inferSelect;
export type DbItem = typeof schema.items.$inferSelect;
export type DbItemShare = typeof schema.itemShares.$inferSelect;

export type RevisionInfo = {
  revision: Pick<DbRevision, "createdAt"> & {
    createdBy: Pick<DbUser, "id" | "name" | "image">;
  };
};
