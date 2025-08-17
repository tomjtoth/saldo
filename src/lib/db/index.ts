import { drizzle } from "drizzle-orm/libsql";
import { ExtractTablesWithRelations, sql } from "drizzle-orm";
import { SQLiteColumn, SQLiteTransaction } from "drizzle-orm/sqlite-core";

import * as schema from "@/lib/db/schema";
import { ResultSet } from "@libsql/client";

export * from "./types";
export { migrator } from "./migrator";
export { atomic } from "./atomic";
export { updater } from "./updater";
export { getArchivePopulator } from "./archives";

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  schema,
  casing: "snake_case",
  logger: true,
  // logger: process.env.NODE_ENV === "development" ? true : false,
});

export const truncateDb = () => db.delete(schema.revisions);

export type DrizzleTx = SQLiteTransaction<
  "async",
  ResultSet,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

type TblCtx<ColName extends string> = { [K in ColName]: SQLiteColumn };

export const orderByLowerName = (table: TblCtx<"name">) =>
  sql`lower(${table.name})`;

export const colActive = (t: TblCtx<"statusId">) => ({
  active: isActive(t).as("active"),
});

const bitFlagCheck = (flag: number) => (table: TblCtx<"statusId">) =>
  sql<boolean>`${table.statusId} & ${sql.raw(flag.toString())} = ${sql.raw(
    flag.toString()
  )}`;

export const isActive = bitFlagCheck(1);
export const isAdmin = bitFlagCheck(2);

const SQLITE_MAX_VARIABLE_NUMBER = 32766;

export const inChunks = async <T extends object>(
  op: (chunk: T[]) => Promise<unknown>,
  arr: T[]
) => {
  let idx = 0;
  const totalRows = arr.length;
  const batchSize = Math.floor(
    SQLITE_MAX_VARIABLE_NUMBER / Object.keys(arr[0]).length
  );

  const res: unknown[] = [];

  while (idx < totalRows) {
    res.push(await op(arr.slice(idx, idx + batchSize)));
    idx += batchSize;
  }

  return res.flat();
};
