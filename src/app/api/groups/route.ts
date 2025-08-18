import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";

import protectedRoute from "@/lib/protectedRoute";
import { db, TGroup } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { err, nullEmptyStrings } from "@/lib/utils";
import { createGroup, updateGroup } from "@/lib/services/groups";

export const POST = protectedRoute(async (req) => {
  const { name, description }: Pick<TGroup, "name" | "description"> =
    await req.json();
  if (
    typeof name !== "string" ||
    (description !== null &&
      !["string", "undefined"].includes(typeof description))
  )
    err();

  const data = { name, description };
  nullEmptyStrings(data);

  return await createGroup(req.__user.id, data);
});

type GroupUpdater = { id: number } & Pick<
  TGroup,
  "name" | "description" | "statusId" | "uuid"
> & {
    generateLink?: true;
    removeLink?: true;
    setAsDefault?: true;
  };

export const PUT = protectedRoute(async (req) => {
  const {
    generateLink,
    removeLink,
    setAsDefault,
    id,
    statusId,
    name,
    description,
  }: GroupUpdater = await req.json();

  if (
    typeof id !== "number" ||
    !["number", "undefined"].includes(typeof statusId) ||
    !["string", "undefined"].includes(typeof name) ||
    (description !== null &&
      !["string", "undefined"].includes(typeof description))
  )
    err();

  if (setAsDefault) {
    await db
      .update(users)
      .set({ defaultGroupId: id })
      .where(eq(users.id, req.__user.id));

    return new Response(null, { status: 200 });
  }

  const data = {
    statusId,
    name,
    description,
    uuid: generateLink ? uuid() : removeLink ? null : undefined,
  };

  nullEmptyStrings(data);

  const group = await updateGroup(req.__user.id, id, data);

  if (!group) err(404);

  return Response.json(group);
});
