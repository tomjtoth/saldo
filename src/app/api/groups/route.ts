import protectedRoute, { ReqWithUser } from "@/lib/protectedRoute";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";

import { db, TGroup } from "@/lib/db";
import { createGroup, updateGroup } from "@/lib/services/groups";
import { users } from "@/lib/db/schema";
import { err, nullEmptyStrings } from "@/lib/utils";

export const POST = protectedRoute(async (req: ReqWithUser) => {
  const data: Pick<TGroup, "name" | "description"> = await req.json();
  if (data?.name === undefined) return new Response(null, { status: 400 });

  const group = await createGroup(req.__user.id, {
    name: data.name,
    description: data.description,
  });

  return Response.json(group);
});

type GroupUpdater = { id: number } & Pick<
  TGroup,
  "name" | "description" | "statusId" | "uuid"
> & {
    generateLink?: true;
    removeLink?: true;
    setAsDefault?: true;
  };

export const PUT = protectedRoute(async (req: ReqWithUser) => {
  const { generateLink, removeLink, setAsDefault, ...data }: GroupUpdater =
    await req.json();

  if (data.id === undefined || typeof data.id !== "number")
    err("missing / NaN id");

  if (setAsDefault) {
    await db
      .update(users)
      .set({ defaultGroupId: data.id })
      .where(eq(users.id, req.__user.id));

    return new Response(null, { status: 200 });
  }

  nullEmptyStrings(data);

  const group = await updateGroup(req.__user.id, data.id, {
    statusId: data.statusId,
    name: data.name,
    description: data.description,
    uuid: generateLink ? uuid() : removeLink ? null : undefined,
  });

  if (!group) return new Response(null, { status: 404 });

  return Response.json(group);
});
