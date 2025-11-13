"use server";

import { eq } from "drizzle-orm";

import { err } from "@/app/_lib/utils";
import { svcModMembership } from "@/app/(memberships)/_lib";
import { currentUser } from "@/app/(users)/_lib";
import { db } from "@/app/_lib/db";
import { categories } from "@/app/_lib/db/schema";
import { userHasAccessToCategory } from "./common";
import { Category } from "./modCategory";

export * from "./getCategories";
export * from "./addCategory";
export * from "./modCategory";

export async function apiSetDefaultCategory(categoryId: Category["id"]) {
  if (typeof categoryId !== "number") err();

  const { id: userId } = await currentUser();

  if (!(await userHasAccessToCategory(userId, categoryId))) err(403);

  const cat = await db.query.categories.findFirst({
    columns: { groupId: true },
    where: eq(categories.id, categoryId),
  });

  await svcModMembership(userId, {
    userId,
    groupId: cat!.groupId!,
    defaultCategoryId: categoryId,
  });
}
