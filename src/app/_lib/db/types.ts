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

export type CrRevision = DbInsert<"revisions">;
export type CrUser = DbInsert<"users">;
export type CrGroup = DbInsert<"groups">;
export type CrMembership = DbInsert<"memberships">;
export type CrCategory = DbInsert<"categories">;
export type CrReceipt = DbInsert<"receipts">;
export type CrItem = DbInsert<"items">;
export type CrItemShare = DbInsert<"itemShares">;

export type DbRevision = DbSelect<"revisions">;
export type DbUser = DbSelect<"users">;
export type DbGroup = DbSelect<"groups">;
export type DbMembership = DbSelect<"memberships">;
export type DbCategory = DbSelect<"categories">;
export type DbReceipt = DbSelect<"receipts">;
export type DbItem = DbSelect<"items">;
export type DbItemShare = DbSelect<"itemShares">;

export type RevisionInfo = {
  revision: Pick<DbRevision, "createdAt"> & {
    createdBy: Pick<DbUser, "id" | "name" | "image">;
  };
};
