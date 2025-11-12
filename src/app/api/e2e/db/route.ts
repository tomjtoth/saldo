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

    res.metadata = await db.all(sql`SELECT * FROM metadata`);
    res.archives = await db.all(sql`
      SELECT
        id,
        table_column_id AS tableColumnId,
        entity_pk1 AS entityPk1,
        entity_pk2 AS entityPk2,
        revision_id AS revisionId,
        payload
      FROM archives`);

    for (const tbl of [
      "revisions",
      "users",
      "groups",
      "chartColors",
      "memberships",
      "categories",
      "receipts",
      "items",
      "itemShares",
    ] as (keyof SchemaTables)[]) {
      // store selected rows per table into result object
      res[tbl] = (await db.select().from(schema[tbl])) as any;
    }

    return res;
  }
);
