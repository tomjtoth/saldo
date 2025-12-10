"use server";

import { db, isActive } from "@/app/_lib/db";
import { err, ErrOpts } from "@/app/_lib/utils";
import { User } from "@/app/(users)/_lib";
import { Category } from "./getCategories";

export async function svcGetCategoryViaUserAccess(
  userId: User["id"],
  categoryId: Category["id"],
  opts?: Pick<ErrOpts, "info" | "args">
) {
  const category = await db.query.categories.findFirst({
    where: {
      id: categoryId,

      group: {
        RAW: isActive,

        memberships: {
          RAW: isActive,
          userId,
        },
      },
    },
  });

  if (!category)
    err({
      info: opts?.info ?? "user accessing category",
      args: { ...opts?.args, userId, categoryId },
    });

  return category;
}
