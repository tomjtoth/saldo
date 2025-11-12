import { sql } from "drizzle-orm";

import { camelToSnakeCase } from "@/app/_lib/utils";
import { db, SchemaTables } from "@/app/_lib/db";
import wrapRoute from "@/app/_lib/wrapRoute";

export const GET = wrapRoute(
  { onlyDuringDevelopment: true, requireSession: false },
  async () => {
    const res: {
      [K in Partial<keyof SchemaTables>]?: unknown[];
    } = {};

    for (const tbl of [
      "archives",
      "metadata",
      "revisions",
      "users",
      "groups",
      "memberships",
      "categories",
      "receipts",
      "chartColors",
      "items",
      "itemShares",
    ] as (keyof SchemaTables)[]) {
      res[tbl] = await db.all(
        sql`SELECT * FROM ${sql.raw(camelToSnakeCase(tbl))}`
      );
    }

    return res;
  }
);
