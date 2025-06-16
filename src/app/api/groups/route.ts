import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { TCrGroup } from "@/lib/models";
import { createGroup } from "@/lib/services/groups";
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
