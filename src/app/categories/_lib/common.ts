import { and, eq, exists, sql } from "drizzle-orm";

import { db, isActive } from "@/app/_lib/db";
import { categories, memberships } from "@/app/_lib/db/schema";
import { User } from "@/app/(users)/_lib";
import { Category } from "./modCategory";

export const WITH_CATEGORIES = {
  with: {
    revision: {
      columns: {
        createdAt: true,
      },
      with: {
        createdBy: { columns: { name: true } },
      },
    },
  },
} as const;

export async function userHasAccessToCategory(
  userId: User["id"],
  catId: Category["id"]
) {
  const res = await db.query.categories.findFirst({
    columns: { id: true },
    where: and(
      eq(categories.id, catId),
      exists(
        db
          .select({ x: sql`1` })
          .from(memberships)
          .where(
            and(
              eq(memberships.groupId, categories.groupId),
              eq(memberships.userId, userId),
              isActive(memberships)
            )
          )
      )
    ),
  });

  return !!res;
}
