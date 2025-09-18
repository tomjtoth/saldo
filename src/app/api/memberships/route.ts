import protectedRoute from "@/lib/protectedRoute";

import { TMembership } from "@/lib/db";
import { isAdmin, updateMembership } from "@/lib/services/memberships";
import { err } from "@/lib/utils";

export const PUT = protectedRoute(async (req) => {
  const { groupId, userId, flags }: TMembership = await req.json();

  if (
    typeof groupId !== "number" ||
    typeof userId !== "number" ||
    typeof flags !== "number"
  )
    err();

  if (!(await isAdmin(req.__user.id, groupId))) err(403);

  const ms = await updateMembership(req.__user.id, {
    groupId,
    userId,
    flags,
  });

  if (!ms) err(404);

  return ms;
});
