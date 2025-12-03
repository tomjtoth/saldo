"use server";

import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { err } from "@/app/_lib/utils";
import { atomic, db } from "@/app/_lib/db";
import { groups, memberships, users } from "@/app/_lib/db/schema";
import { currentUser, User } from "@/app/(users)/_lib";
import { svcModGroup } from "./modGroup";
import { Group } from "./getGroups";

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
  if (!group) err("link expired");

  const ms = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, userId),
      eq(memberships.groupId, group.id)
    ),
  });
  if (ms) err("already a member");

  return await svcAddMember(group.id, userId);
}

export async function apiSetDefaultGroup(id: Group["id"]) {
  if (typeof id !== "number") err();

  const { id: userId } = await currentUser();

  await db
    .update(users)
    .set({ defaultGroupId: id })
    .where(eq(users.id, userId));
}

export async function apiRmInviteLink(id: Group["id"]) {
  if (typeof id !== "number") err(400);

  const user = await currentUser();

  return svcModGroup(user.id, { id, uuid: null });
}

export async function apiGenInviteLink(id: Group["id"]) {
  if (typeof id !== "number") err(400);

  const user = await currentUser();

  return await svcModGroup(user.id, { id, uuid: uuidv4() });
}
