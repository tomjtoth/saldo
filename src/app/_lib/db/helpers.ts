import { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

import { db } from "./instance";
import { chartColors, revisions } from "./schema";

export async function truncateDb() {
  await db.transaction(async (tx) => {
    await tx.delete(revisions);
    await tx.delete(chartColors);
  });
}

type TblCtx<ColName extends string> = { [K in ColName]: SQLiteColumn };

const bitFlagCheck = (flag: number) => (table: TblCtx<"flags">) =>
  sql<boolean>`${table.flags} & ${sql.raw(flag.toString())} = ${sql.raw(
    flag.toString()
  )}`;

export const isActive = bitFlagCheck(1);
export const isAdmin = bitFlagCheck(2);

const SQLITE_MAX_VARIABLE_NUMBER = 32766;

export const inChunks = async <T extends object>(
  op: (chunk: T[]) => Promise<unknown>,
  arr: T[],
  numberOfCols: number
) => {
  let idx = 0;
  const totalRows = arr.length;
  const batchSize = Math.floor(SQLITE_MAX_VARIABLE_NUMBER / numberOfCols);

  const res: unknown[] = [];

  while (idx < totalRows) {
    res.push(await op(arr.slice(idx, idx + batchSize)));
    idx += batchSize;
  }

  return res.flat();
};
