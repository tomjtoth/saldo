import protectedRoute, { ReqWithUser } from "@/lib/protectedRoute";
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

export const POST = protectedRoute(async (req: ReqWithUser) => {
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

  const cat = await createCategory(req.__user.id, data);

  return Response.json(cat);
});

export const PUT = protectedRoute(async (req: ReqWithUser) => {
  const {
    id,
    groupId,
    statusId,
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
      typeof statusId !== "number" &&
      typeof setAsDefault !== "boolean")
  )
    err();

  if (!(await userAccessToCat(req.__user.id, id)))
    return new Response(null, { status: 403 });

  if (setAsDefault) {
    await updateMembership(req.__user.id, {
      userId: req.__user.id,
      groupId,
      defaultCategoryId: id,
    });

    return new Response(null, { status: 200 });
  }

  const updated = await updateCategory(
    id,
    req.__user.id,
    nulledEmptyStrings({ name, description, statusId })
  );

  return Response.json(updated);
});
