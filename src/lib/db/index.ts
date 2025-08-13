import { drizzle } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

import * as schema from "@/lib/db/schema";

export * from "./types";
export { migrator } from "./migrator";
export { atomic } from "./atomic";
export { updater } from "./updater";
export { getArchivePopulator } from "./archives";

export const db = drizzle({
  connection: process.env.DRIZZLE_URL!,
  schema,
  casing: "snake_case",
  logger: true,
});

type TblCtx<ColName extends string> = { [K in ColName]: SQLiteColumn };
type SqlCtx = { sql: typeof sql };

export const orderByLowerName = (table: TblCtx<"name">, { sql }: SqlCtx) =>
  sql`lower(${table.name})`;

export const colActive = (t: TblCtx<"statusId">, o: SqlCtx) => ({
  active: isActive(t, o).as("active"),
});

const bitFlagCheck =
  (flag: number) =>
  (table: TblCtx<"statusId">, { sql }: SqlCtx) =>
    sql<boolean>`${table.statusId} & ${flag} = ${flag}`;

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
