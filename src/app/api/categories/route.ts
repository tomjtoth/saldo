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
  const data: TCategoryUpdater &
    Pick<TCategory, "id" | "groupId"> & {
      setAsDefault?: true;
    } = await req.json();

  if (
    !data.id ||
    !data.groupId ||
    (!data.name && !data.description && !data.statusId && !data.setAsDefault)
  ) {
    return new Response(null, { status: 400 });
  }

  if (!(await userAccessToCat(req.__user.id, data.id)))
    return new Response(null, { status: 403 });

  if (data.setAsDefault) {
    await updateMembership(req.__user.id, {
      userId: req.__user.id,
      groupId: data.groupId,
      defaultCategoryId: data.id,
    });

    return new Response(null, { status: 200 });
  }

  nullEmptyStrings(data);

  const updated = await updateCategory(data.id, req.__user.id, {
    name: data.name,
    description: data.description,
    statusId: data.statusId,
  });

  return Response.json(updated);
});
