"use server";

import { and, eq, exists, sql } from "drizzle-orm";

import { db, isActive } from "@/app/_lib/db";
import { err, ErrOpts } from "@/app/_lib/utils";
import { categories, groups, memberships } from "@/app/_lib/db/schema";
import { User } from "@/app/(users)/_lib";
import { Category } from "./getCategories";

export async function svcGetCategoryViaUserAccess(
  userId: User["id"],
  categoryId: Category["id"],
  opts?: Pick<ErrOpts, "info" | "args">
) {
  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, categoryId),
      exists(
        db
          .select({ x: sql`1` })
          .from(memberships)
          .innerJoin(groups, eq(memberships.groupId, groups.id))
          .where(
            and(
              eq(memberships.groupId, categories.groupId),
              eq(memberships.userId, userId),
              isActive(memberships),
              isActive(groups)
            )
          )
      )
    ),
  });

  if (!category)
    err({
      info: opts?.info ?? "user accessing category",
      args: { ...opts?.args, userId, categoryId },
    });

  return category;
}
