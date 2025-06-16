import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { createCategory } from "@/lib/services/categories";
import { TCrCategory } from "@/lib/models";

export async function POST(req: NextRequest) {
  const data = (await req.json()) as TCrCategory;
  if (data.name === undefined) return new Response(null, { status: 401 });

  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });
  const user = await currentUser(sess);

  const cat = await createCategory(user.id, {
    groupId: data.groupId,
    name: data.name,
    description: data.description,
  });
  return Response.json(cat.get({ plain: true }));
}
