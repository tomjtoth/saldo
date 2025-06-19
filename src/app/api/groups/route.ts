import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";

import { auth } from "@/auth";
import { TCrGroup } from "@/lib/models";
import { createGroup, GroupUpdater, updateGroup } from "@/lib/services/groups";
import { currentUser } from "@/lib/services/user";

export async function POST(req: NextRequest) {
  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });

  const data = (await req.json()) as TCrGroup;
  if (data?.name === undefined) return new Response(null, { status: 400 });

  const user = await currentUser(sess);
  const group = await createGroup(user.id, {
    name: data.name,
    description: data.description,
  });

  return Response.json(group.get({ plain: true }));
}

export async function PUT(req: NextRequest) {
  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });

  const [data, user] = await Promise.all([req.json(), currentUser(sess)]);
  const { id, statusId, name, description, generateLink, removeLink } =
    data as GroupUpdater & {
      generateLink?: true;
      removeLink?: true;
    };

  try {
    const group = await updateGroup(user.id, {
      id,
      statusId,
      name,
      description,
      uuid: generateLink ? uuid() : removeLink ? null : undefined,
    });

    if (!group) return new Response(null, { status: 404 });

    return Response.json(group.get({ plain: true }));
  } catch (err) {
    return new Response(null, {
      status: 400,
      statusText: (err as Error).message,
    });
  }
}
