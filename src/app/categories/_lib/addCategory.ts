"use server";

import { eq } from "drizzle-orm";

import { atomic, CrCategory } from "@/app/_lib/db";
import { categories } from "@/app/_lib/db/schema";
import { currentUser, User } from "@/app/(users)/_lib";
import { err, is, nullEmptyStrings } from "@/app/_lib/utils";
import { svcGetCategories } from "./getCategories";

export type CategoryAdder = Pick<
  CrCategory,
  "groupId" | "name" | "description"
>;

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

  is.stringWith3ConsecutiveLetters(name);

  const data = nullEmptyStrings({ groupId, name, description });

  const user = await currentUser();

  return await svcAddCategory(user.id, data);
}

export async function svcAddCategory(
  revisedBy: User["id"],
  data: CategoryAdder
) {
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

      const [res] = await svcGetCategories(revisedBy, {
        tx,
        where: eq(categories.id, id),
      });

      return res;
    }
  );
}
