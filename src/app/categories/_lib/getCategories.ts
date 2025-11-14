"use server";

import { eq, and, sql, exists } from "drizzle-orm";

import { sortByName } from "@/app/_lib/utils";
import { db, isActive, getArchivePopulator } from "@/app/_lib/db";
import { memberships, groups, categories } from "@/app/_lib/db/schema";
import { SvcGetEntitiesArgs } from "@/app/_lib/types";

export type Category = Awaited<ReturnType<typeof svcGetCategories>>[number];

export async function svcGetCategories(...args: SvcGetEntitiesArgs) {
  const [userId, { tx, where } = {}] = args;

  const arr = await (tx ?? db).query.categories.findMany({
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

    where:
      where ??
      and(
        isActive(groups),
        eq(groups.id, categories.id),
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

  return withArchives(arr.toSorted(sortByName));
}
