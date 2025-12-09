"use server";

import { eq, and, exists, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { apiInternal, be, err, ErrOpts } from "@/app/_lib/utils";
import { atomic, db, isActive, isAdmin } from "@/app/_lib/db";
import { groups, memberships, users } from "@/app/_lib/db/schema";
import { currentUser, User } from "@/app/(users)/_lib";
import { svcModGroup } from "./modGroup";
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
      info: opts?.info ?? "user accessing group",
      args: { ...opts?.args, userId, groupId },
    });

  return group;
}

export async function svcAddMember(groupId: Group["id"], userId: User["id"]) {
  return await atomic(
    { operation: "adding new member", revisedBy: userId },
    async (tx, revisionId) => {
      await tx.update(groups).set({ uuid: null }).where(eq(groups.id, groupId));

      return await tx.insert(memberships).values({
        userId,
        groupId,
        revisionId,
      });
    }
  );
}

export async function joinGroup(
  uuid: NonNullable<Group["uuid"]>,
  userId: User["id"]
) {
  const group = await db.query.groups.findFirst({
    where: eq(groups.uuid, uuid),
  });
  if (!group) err("link expired", { args: { uuid } });

  const ms = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, userId),
      eq(memberships.groupId, group.id)
    ),
  });
  if (ms) err("already a member", { args: { userId, group } });

  return await svcAddMember(group.id, userId);
}

export async function apiSetDefaultGroup(id: Group["id"]) {
  return apiInternal(async () => {
    be.number(id, "group ID");

    const user = await currentUser();

    await svcGetGroupViaUserAccess(user.id, id, {
      info: "setting default group",
    });

    await db
      .update(users)
      .set({ defaultGroupId: id })
      .where(eq(users.id, user.id));
  });
}

export async function apiRmInviteLink(id: Group["id"]) {
  return apiInternal(async () => {
    be.number(id, "group ID");

    const user = await currentUser();

    await svcGetGroupViaUserAccess(user.id, id, {
      userMustBeAdmin: true,
      info: "rm invite link",
    });

    return svcModGroup(user.id, { id, uuid: null });
  });
}

export async function apiGenInviteLink(id: Group["id"]) {
  return apiInternal(async () => {
    be.number(id, "group ID");

    const user = await currentUser();

    return await svcModGroup(user.id, { id, uuid: uuidv4() });
  });
}
