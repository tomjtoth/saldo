import { drizzle } from "drizzle-orm/libsql";
import { ExtractTablesWithRelations, sql } from "drizzle-orm";
import { SQLiteColumn, SQLiteTransaction } from "drizzle-orm/sqlite-core";

import * as schema from "@/app/_lib/db/schema";
import { ResultSet } from "@libsql/client";

export * from "./types";
export * from "./migrator";
export * from "./atomic";
export { updater } from "./updater";
export { getArchivePopulator } from "./archives";

export const db = drizzle({
  connection:
    process.env.DATABASE_URL ??
    (process.env.NODE_ENV === "development" ? "file:data/dev.db" : ":memory:"),
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

export const SQL_RANDOM_COLOR = sql.raw(
  "printf('%07x', abs(random()) % 0x2000000)"
);

export const groupsWithUsersCTE = (userId: number) => sql`
  groups_with_users AS (
    SELECT
      m.group_id AS gid,
      g.name,
      jsonb_group_array(jsonb_object(
        'id', m2.user_id,
        'name', u.name,
        'color', printf(
          '#%06x', 
          coalesce(
            (
              SELECT cc.color FROM chart_colors cc
              WHERE cc.user_id = ${userId}
              AND cc.group_id = m.group_id
              AND cc.member_id = m2.user_id
            ),
            (
              SELECT cc.color FROM chart_colors cc
              WHERE cc.user_id = m2.user_id
              AND cc.group_id = m.group_id
              AND cc.member_id IS NULL
            ),
            (
              SELECT cc.color FROM chart_colors cc
              WHERE cc.user_id = m2.user_id
              AND cc.group_id IS NULL
              AND cc.member_id IS NULL
            ),
            abs(random()) % 0x1000000
          )
        )
      )) as users
    FROM memberships m
    INNER JOIN groups g ON g.id = m.group_id
    INNER JOIN memberships m2 ON m2.group_id = m.group_id
    INNER JOIN users u ON u.id = m2.user_id 
    WHERE m.user_id = ${userId}
    GROUP BY m.group_id
    ORDER BY g.name
  )
`;

export const orderByLowerName = (table: TblCtx<"name">) =>
  sql`lower(${table.name})`;

export const colActive = (t: TblCtx<"flags">) => ({
  active: isActive(t).as("active"),
});

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
