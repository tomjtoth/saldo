import { eq } from "drizzle-orm";

import {
  atomic,
  getArchivePopulator,
  modEntity,
  DbCategory,
} from "@/app/_lib/db";
import { categories } from "@/app/_lib/db/schema";
import { currentUser, User } from "@/app/(users)/_lib";
import { err, nullEmptyStrings } from "@/app/_lib/utils";
import { userHasAccessToCategory, WITH_CATEGORIES } from "./common";
import { svcGetCategories } from "./getCategories";

type CategoryModifier = Pick<DbCategory, "id"> &
  Partial<Pick<DbCategory, "name" | "description" | "flags">>;

export type Category = Awaited<ReturnType<typeof svcModCategory>>;

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

  const data = {
    id,
    name,
    description,
    flags,
  };

  nullEmptyStrings(data);

  const user = await currentUser();

  if (!(await userHasAccessToCategory(user.id, id))) err(403);

  return await svcModCategory(user.id, data);
}

export async function svcModCategory(
  revisedBy: User["id"],
  { id, ...modifier }: CategoryModifier
): Promise<
  Awaited<ReturnType<typeof svcGetCategories>>[number]["categories"][number]
> {
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

      // TODO: merge this call into modEntity and
      // get the ReturnType according to the args passed
      const res = await tx.query.categories.findFirst({
        ...WITH_CATEGORIES,
        where: eq(categories.id, cat.id),
      });

      const withArchives = await getArchivePopulator("categories", "id", {
        tx,
      });

      return withArchives([res!])[0];
    }
  );
}
