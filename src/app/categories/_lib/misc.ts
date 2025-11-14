"use server";

import { eq } from "drizzle-orm";

import { err } from "@/app/_lib/utils";
import { svcModMembership } from "@/app/(memberships)/_lib";
import { currentUser } from "@/app/(users)/_lib";
import { db } from "@/app/_lib/db";
import { categories } from "@/app/_lib/db/schema";
import { userMayModCategory } from "./common";
import { Category } from "./getCategories";

export async function apiSetDefaultCategory(categoryId: Category["id"]) {
  if (typeof categoryId !== "number") err();

  const { id: userId } = await currentUser();

  await userMayModCategory(userId, categoryId);

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
