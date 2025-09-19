import protectedRoute from "@/lib/protectedRoute";
import { err, nulledEmptyStrings } from "@/lib/utils";

import { TCategory } from "@/lib/db";
import {
  TCategoryUpdater,
  updateCategory,
  userAccessToCat,
} from "@/lib/services/categories";
import { updateMembership } from "@/lib/services/memberships";

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
