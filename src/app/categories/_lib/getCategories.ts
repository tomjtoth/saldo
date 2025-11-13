import { eq, and, sql, exists } from "drizzle-orm";

import { sortByName } from "@/app/_lib/utils";
import { WITH_CATEGORIES } from "./common";
import { db, isActive, getArchivePopulator } from "@/app/_lib/db";
import { memberships, groups } from "@/app/_lib/db/schema";
import { User } from "@/app/(users)/_lib";

export async function svcGetCategories(userId: User["id"]) {
  const res = await db.query.groups.findMany({
    columns: {
      id: true,
      name: true,
    },

    with: {
      memberships: {
        columns: { defaultCategoryId: true },
        with: { user: { columns: { id: true, name: true } } },
      },
      revision: {
        columns: { createdAt: true },
        with: { createdBy: { columns: { id: true, name: true } } },
      },
      categories: WITH_CATEGORIES,
    },

    where: and(
      isActive(groups),
      exists(
        db
          .select({ x: sql`1` })
          .from(memberships)
          .where(
            and(
              eq(memberships.groupId, groups.id),
              eq(memberships.userId, userId),
              isActive(memberships)
            )
          )
      )
    ),
  });

  const withArchives = await getArchivePopulator("categories", "id");

  res.sort(sortByName);

  return res.map((group) => ({
    ...group,
    categories: withArchives(group.categories.toSorted(sortByName)),
  }));
}
