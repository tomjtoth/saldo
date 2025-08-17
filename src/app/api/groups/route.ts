import protectedRoute, { ReqWithUser } from "@/lib/protectedRoute";
import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db, TGroup } from "@/lib/db";
import { createGroup, updateGroup } from "@/lib/services/groups";
import { currentUser } from "@/lib/services/user";
import { users } from "@/lib/db/schema";
import { nullEmptyStrings } from "@/lib/utils";

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

export async function PUT(req: NextRequest) {
  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });

  const [data, user] = await Promise.all([req.json(), currentUser(sess)]);
  const {
    id,
    statusId,
    name,
    description,
    generateLink,
    removeLink,
    setAsDefault,
  } = data as GroupUpdater;

  if (setAsDefault) {
    await db
      .update(users)
      .set({
        defaultGroupId: id,
      })
      .where(eq(users.id, user.id));

    return new Response(null, { status: 200 });
  }

  nullEmptyStrings(data);

  try {
    const group = await updateGroup(user.id, id, {
      statusId,
      name,
      description,
      uuid: generateLink ? uuid() : removeLink ? null : undefined,
    });

    if (!group) return new Response(null, { status: 404 });

    return Response.json(group);
  } catch (err) {
    return new Response(null, {
      status: 400,
      statusText: (err as Error).message,
    });
  }
}
