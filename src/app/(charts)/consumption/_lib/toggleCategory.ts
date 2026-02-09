"use server";

import { and, eq } from "drizzle-orm";

import { categoriesHiddenFromConsumption as chfc } from "@/app/_lib/db/schema";
import { db } from "@/app/_lib/db";
import { apiInternal, be } from "@/app/_lib/utils";
import { currentUser, User } from "@/app/(users)/_lib";
import { Category, svcGetCategoryViaUserAccess } from "@/app/categories/_lib";

export async function apiToggleCategoryVisibility(cid: Category["id"]) {
  return apiInternal(async () => {
    be.number(cid);

    const user = await currentUser();

    await svcGetCategoryViaUserAccess(user.id, cid);

    return await svcToggleCategoryVisibility(user.id, cid);
  });
}

export async function svcToggleCategoryVisibility(
  userId: User["id"],
  categoryId: Category["id"]
) {
  const entry = await db.query.categoriesHiddenFromConsumption.findFirst({
    where: { userId, categoryId },
  });

  if (!!entry) {
    await db
      .delete(chfc)
      .where(and(eq(chfc.categoryId, categoryId), eq(chfc.userId, userId)));
  } else {
    await db.insert(chfc).values({ userId, categoryId });
  }
}
