import { eq } from "drizzle-orm";

import { atomic, modEntity, DbCategory } from "@/app/_lib/db";
import { categories } from "@/app/_lib/db/schema";
import { currentUser, User } from "@/app/(users)/_lib";
import { err, nullEmptyStrings } from "@/app/_lib/utils";
import { userMayModCategory } from "./common";
import { svcGetCategories } from "./getCategories";

type CategoryModifier = Pick<DbCategory, "id"> &
  Partial<Pick<DbCategory, "name" | "description" | "flags">>;

export async function apiModCategory({
  id,
  flags,
  name,
  description,
}: CategoryModifier) {
  if (
    typeof id !== "number" ||
    (typeof name !== "string" &&
      typeof description !== "string" &&
      typeof flags !== "number")
  )
    err();

  const data = nullEmptyStrings({
    id,
    name,
    description,
    flags,
  });

  const user = await currentUser();

  await userMayModCategory(user.id, id);

  return await svcModCategory(user.id, data);
}

export async function svcModCategory(
  revisedBy: User["id"],
  { id, ...modifier }: CategoryModifier
) {
  return await atomic(
    { operation: "Updating category", revisedBy },
    async (tx, revisionId) => {
      const cat = await tx.query.categories.findFirst({
        where: eq(categories.id, id),
      });

      if (!cat) err(404);

      await modEntity(cat, modifier, {
        tx,
        tableName: "categories",
        revisionId,
        primaryKeys: { id: true },
      });

      const [res] = await svcGetCategories(revisedBy, {
        where: eq(categories.id, cat.id),
      });

      return res;
    }
  );
}
