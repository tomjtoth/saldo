"use server";

import { eq, and, exists, sql } from "drizzle-orm";

import { err, ErrOpts } from "@/app/_lib/utils";
import { db, isActive, isAdmin } from "@/app/_lib/db";
import { groups, memberships } from "@/app/_lib/db/schema";
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
    where: and(
      ...[
        ...(groupMustBeActive ? [isActive(groups)] : []),
        eq(groups.id, groupId),
        exists(
          db
            .select({ x: sql`1` })
            .from(memberships)
            .where(
              and(
                ...[
                  eq(memberships.groupId, groupId),
                  eq(memberships.userId, userId),
                  isActive(memberships),
                  ...(userMustBeAdmin ? [isAdmin(memberships)] : []),
                ]
              )
            )
        ),
      ]
    ),
  });

  if (!group)
    err({
      ...opts,
      info: opts?.info ?? "user accessing group",
      args: { ...opts?.args, userId, groupId },
    });

  return group;
}
