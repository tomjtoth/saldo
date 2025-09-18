import protectedRoute from "@/lib/protectedRoute";
import {
  err,
  has3ConsecutiveLetters,
  nullEmptyStrings,
  nulledEmptyStrings,
} from "@/lib/utils";

import { TCategory } from "@/lib/db";
import {
  createCategory,
  TCategoryUpdater,
  updateCategory,
  userAccessToCat,
} from "@/lib/services/categories";
import { updateMembership } from "@/lib/services/memberships";

export const POST = protectedRoute(async (req) => {
  const {
    name,
    groupId,
    description,
  }: Pick<TCategory, "name" | "groupId" | "description"> = await req.json();

  if (
    typeof name !== "string" ||
    typeof groupId !== "number" ||
    !["string", "undefined"].includes(typeof description)
  )
    err();

  has3ConsecutiveLetters(name);

  const data = {
    groupId,
    name,
    description,
  };

  nullEmptyStrings(data);

  return await createCategory(req.__user.id, data);
});

export const PUT = protectedRoute(async (req) => {
  const {
    id,
    groupId,
    flags,
    name,
    description,
    setAsDefault,
  }: TCategoryUpdater &
    Pick<TCategory, "id" | "groupId"> & {
      setAsDefault?: true;
    } = await req.json();

  if (
    typeof id !== "number" ||
    typeof groupId !== "number" ||
    (typeof name !== "string" &&
      typeof description !== "string" &&
      typeof flags !== "number" &&
      typeof setAsDefault !== "boolean")
  )
    err();

  if (!(await userAccessToCat(req.__user.id, id))) err(403);

  if (setAsDefault) {
    await updateMembership(req.__user.id, {
      userId: req.__user.id,
      groupId,
      defaultCategoryId: id,
    });

    return;
  }

  return await updateCategory(
    id,
    req.__user.id,
    nulledEmptyStrings({ name, description, flags })
  );
});
