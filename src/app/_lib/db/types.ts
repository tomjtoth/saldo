import { db } from "./instance";
import { schema } from "./relations";

export type Schema = typeof schema;

export type DrizzleTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type QueryParamsOf<T extends keyof Schema> = Parameters<
  DrizzleTx["query"][T]["findMany"]
>[0];

export type WhereClauseOf<T extends keyof Schema> = NonNullable<
  QueryParamsOf<T>
> extends infer P
  ? P extends { where?: infer W }
    ? W
    : never
  : never;

export type DbInsert<T extends keyof Schema> = Schema[T]["$inferInsert"];
export type DbSelect<T extends keyof Schema> = Schema[T]["$inferSelect"];

export type ConsumptionData = {
  categoryId: DbCategory["id"];
} & {
  [userId: string]: DbUser["id"];
};

export type BalanceData = {
  relations: string[];
  data: {
    date: number;
    [relation: string]: number;
  }[];
  minMaxes: { [date: number]: { min: number; max: number } };
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
  revision: Pick<DbRevision, "createdAt" | "createdById">;
};
