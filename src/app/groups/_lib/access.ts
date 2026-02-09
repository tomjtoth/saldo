"use server";

import { sql } from "drizzle-orm";

import { err, ErrOpts } from "@/app/_lib/utils";
import { db, isActive, isAdmin } from "@/app/_lib/db";
import { User } from "@/app/(users)/_lib";
import { Group } from "./getGroups";

export async function svcGetGroupViaUserAccess(
  userId: User["id"],
  groupId: Group["id"],
  opts?: Pick<ErrOpts, "info" | "args"> & {
    /**
     * @default false
     */
    userMustBeAdmin?: true;
    /**
     * @default true
     */
    groupMustBeActive?: false;
  }
) {
  const userMustBeAdmin = opts?.userMustBeAdmin ?? false;
  const groupMustBeActive = opts?.groupMustBeActive ?? true;

  const group = await db.query.groups.findFirst({
    where: {
      id: groupId,

      ...(groupMustBeActive ? { RAW: isActive } : {}),

      memberships: {
        userId,

        RAW: (ms) =>
          sql.join(
            [isActive(ms), ...(userMustBeAdmin ? [isAdmin(ms)] : [])],
            sql` AND `
          ),
      },
    },
  });

  if (!group)
    err({
      ...opts,
      info: opts?.info ?? "user accessing group",
      args: { ...opts?.args, userId, groupId },
    });

  return group;
}
