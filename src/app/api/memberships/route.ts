import protectedRoute, { ReqWithUser } from "@/lib/protectedRoute";

import { TMembership } from "@/lib/db";
import { isAdmin, updateMembership } from "@/lib/services/memberships";
import { err } from "@/lib/utils";

export const PUT = protectedRoute(async (req: ReqWithUser) => {
  const { groupId, userId, statusId }: TMembership = await req.json();

  if (
    typeof groupId !== "number" ||
    typeof userId !== "number" ||
    typeof statusId !== "number"
  )
    err();

  if (!(await isAdmin(req.__user.id, groupId))) err(403);

  const ms = await updateMembership(req.__user.id, {
    groupId,
    userId,
    statusId,
  });

  if (!ms) err(404);

  return Response.json(ms);
});
