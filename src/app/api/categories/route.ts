import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { createCategory } from "@/lib/services/categories";

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (data.description) return Response.error();

  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });
  const user = await currentUser(sess);

  const cat = await createCategory(user.id, data);
  return Response.json(cat.get({ plain: true }));
}
