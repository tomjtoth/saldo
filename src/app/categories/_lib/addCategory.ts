import { eq } from "drizzle-orm";

import { atomic, DbCategory } from "@/app/_lib/db";
import { categories } from "@/app/_lib/db/schema";
import { currentUser } from "@/app/(users)/_lib";
import {
  err,
  has3ConsecutiveLetters,
  nullEmptyStrings,
} from "@/app/_lib/utils";
import { WITH_CATEGORIES } from "./common";
import { Category } from "./modCategory";

type CategoryAdder = Pick<DbCategory, "groupId" | "name" | "description">;

export async function apiAddCategory({
  groupId,
  name,
  description,
}: CategoryAdder) {
  const typeDescr = typeof description;

  if (
    typeof name !== "string" ||
    typeof groupId !== "number" ||
    (typeDescr !== "string" && typeDescr !== "undefined")
  )
    err();

  has3ConsecutiveLetters(name);

  const data = { groupId, name, description };

  nullEmptyStrings(data);

  const user = await currentUser();

  return await svcAddCategory(user.id, data);
}

export async function svcAddCategory(
  revisedBy: number,
  data: CategoryAdder
): Promise<Category> {
  return await atomic(
    { operation: "Creating category", revisedBy },
    async (tx, revisionId) => {
      const [{ id }] = await tx
        .insert(categories)
        .values({
          ...data,
          revisionId,
        })
        .returning({ id: categories.id });

      const res = await tx.query.categories.findFirst({
        ...WITH_CATEGORIES,
        where: eq(categories.id, id),
      });

      return { ...res!, archives: [] };
    }
  );
}
