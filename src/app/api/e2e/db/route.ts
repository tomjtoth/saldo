import { sql } from "drizzle-orm";

import { db, Schema, SchemaTables } from "@/app/_lib/db";
import * as schema from "@/app/_lib/db/schema";
import wrapRoute from "@/app/_lib/wrapRoute";

export const GET = wrapRoute(
  { onlyDuringDevelopment: true, requireSession: false },
  async () => {
    const res: {
      [K in Partial<keyof SchemaTables>]?: Schema[K]["$inferSelect"][];
    } = {};

    res.archives = await db.all(sql`SELECT * FROM archives`);
    res.metadata = await db.all(sql`SELECT * FROM metadata`);

    for (const tbl of [
      "users",
      "revisions",
      "groups",
      "memberships",
      "categories",
      "receipts",
      "chartColors",
      "items",
      "itemShares",
    ] as (keyof SchemaTables)[]) {
      // store selected rows per table into result object
      res[tbl] = (await db.select().from(schema[tbl])) as any;
    }

    return res;
  }
);
