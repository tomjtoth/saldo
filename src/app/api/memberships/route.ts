import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { getGroupsDataFor, updateMembership } from "@/lib/services/groups";
import { TMembership } from "@/lib/models";

export async function PUT(req: NextRequest) {
  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });

  const user = await currentUser(sess);

  const [groups, body] = await Promise.all([
    getGroupsDataFor(user.id),
    req.json(),
  ]);

  const { groupId, userId, statusId, admin } = body as TMembership;
  if (!groupId || !userId) return new Response(null, { status: 400 });

  const group = groups.find((grp) => grp.id === groupId)!;
  if (!group.Memberships![0].admin) return new Response(null, { status: 403 });

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
