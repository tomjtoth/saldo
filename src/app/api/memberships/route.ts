import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { isAdmin, updateMembership } from "@/lib/services/memberships";
import { TMembership } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });

  const user = await currentUser(sess);

  const body = await req.json();

  const { groupId, userId, statusId, isAdmin: admin } = body as TMembership;
  if (!groupId || !userId) return new Response(null, { status: 400 });

  if (!(await isAdmin(user.id, groupId)))
    return new Response(null, { status: 403 });

  try {
    const ms = await updateMembership(user.id, {
      groupId,
      userId,
      statusId,
      admin,
    });

    if (!ms) return new Response(null, { status: 404 });

    return Response.json(ms);
  } catch (err) {
    return new Response(null, {
      status: 400,
      statusText: (err as Error).message,
    });
  }
}
