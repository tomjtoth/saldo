"use server";

import { and, eq, exists, sql, SQL } from "drizzle-orm";

import { sortByName } from "@/app/_lib/utils";
import { db, DrizzleTx, getArchivePopulator, isActive } from "@/app/_lib/db";
import { SELECT_CATEGORIES } from "@/app/_lib";
import { User } from "@/app/(users)/_lib";
import { categories, memberships } from "@/app/_lib/db/schema";

export type Category = Awaited<ReturnType<typeof svcGetCategories>>[number];

export async function svcGetCategories(
  userId: User["id"],
  opts: { tx?: DrizzleTx; where?: SQL } = {}
) {
  const tx = opts.tx ?? db;
  const arr = await tx.query.categories.findMany({
    ...SELECT_CATEGORIES,

    where:
      opts.where ??
      exists(
        tx
          .select({ x: sql`1` })
          .from(memberships)
          .where(
            and(
              eq(categories.groupId, memberships.groupId),
              eq(memberships.userId, userId),
              isActive(memberships)
            )
          )
      ),
  });

  const withArchives = await getArchivePopulator("categories", "id");

  return withArchives(arr.toSorted(sortByName));
}
