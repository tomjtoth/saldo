"use server";

import { eq } from "drizzle-orm";

import { atomic, modEntity, DbCategory } from "@/app/_lib/db";
import { categories } from "@/app/_lib/db/schema";
import { currentUser, User } from "@/app/(users)/_lib";
import { apiInternal, be, err, is, nullEmptyStrings } from "@/app/_lib/utils";
import { svcGetCategoryViaUserAccess } from "./accessChecker";
import { svcGetCategories } from "./getCategories";

export type CategoryModifier = Pick<DbCategory, "id"> &
  Partial<Pick<DbCategory, "name" | "description" | "flags">>;

export async function apiModCategory({
  id,
  flags,
  name,
  description,
}: CategoryModifier) {
  return apiInternal(async () => {
    be.number(id, "category ID");

    if (!is.string(name) && !is.string(description) && !is.number(flags))
      err("name, description or flags must be set", {
        info: "modifying category",
        args: { name, description, flags },
      });

    const data = nullEmptyStrings({
      id,
      name,
      description,
      flags,
    });

    const user = await currentUser();

    await svcGetCategoryViaUserAccess(user.id, id, {
      info: "modifying category",
      args: { name, description, flags },
    });

    return await svcModCategory(user.id, data);
  });
}

export async function svcModCategory(
  revisedBy: User["id"],
  { id, ...modifier }: CategoryModifier
) {
  return await atomic(
    { operation: "Updating category", revisedBy },
    async (tx, revisionId) => {
      const [cat] = await tx.query.categories.findMany({
        where: eq(categories.id, id),
      });

      await modEntity(cat, modifier, {
        tx,
        tableName: "categories",
        revisionId,
        primaryKeys: { id: true },
      });

      const [res] = await svcGetCategories(revisedBy, {
        tx,
        where: eq(categories.id, cat.id),
      });

      return res;
    }
  );
}
