import { sql } from "drizzle-orm";

import { db, Schema, SchemaTables } from "@/app/_lib/db";
import * as schema from "@/app/_lib/db/schema";
import { svcGetGroups } from "@/app/groups/_lib";
import { svcGetCategories } from "@/app/categories/_lib";
import { svcGetReceipts } from "@/app/receipts/_lib";
import { svcGetBalance } from "@/app/(charts)/balance/_lib";
import { svcGetConsumption } from "@/app/(charts)/consumption/_lib";
import wrapRoute from "@/app/_lib/wrapRoute";

export const GET = wrapRoute(
  { onlyDuringDevelopment: true, requireSession: false },
  async () => {
    const res: {
      [K in Partial<keyof SchemaTables>]?: Schema[K]["$inferSelect"][];
    } & {
      perUser: {
        [userId: number]: {
          groups: Awaited<ReturnType<typeof svcGetGroups>>;
          categories: Awaited<ReturnType<typeof svcGetCategories>>;
          receipts: Awaited<ReturnType<typeof svcGetReceipts>>;
          balance: Awaited<ReturnType<typeof svcGetBalance>>;
          consumption: Awaited<ReturnType<typeof svcGetConsumption>>;
        };
      };
    } = { perUser: {} };

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

    for (const user of res.users!) {
      res.perUser[user.id] = {
        groups: await svcGetGroups(user.id),
        categories: await svcGetCategories(user.id),
        receipts: await svcGetReceipts(user.id),
        balance: await svcGetBalance(user.id),
        consumption: await svcGetConsumption(user.id),
      };
    }

    return res;
  }
);
