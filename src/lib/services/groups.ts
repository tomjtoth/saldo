"use server";

import { eq, exists, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { err, nullEmptyStrings, sortByName } from "../utils";
import { updater } from "../db/updater";
import { atomic, db, isActive, TCrGroup, TGroup } from "../db";
import { groups, memberships, users } from "../db/schema";
import { withUser } from "./users";

const COLS_WITH = {
  columns: {
    id: true,
    name: true,
    description: true,
    flags: true,
    uuid: true,
  },
  with: {
    memberships: {
      columns: { flags: true },
      with: {
        user: {
          columns: { name: true, id: true, email: true, flags: true },
        },
      },
    },
  },
};

export async function svcCreateGroup(name: string, description?: string) {
  const { id } = await withUser();

  if (
    typeof name !== "string" ||
    (description !== null &&
      !["string", "undefined"].includes(typeof description))
  )
    err();

  const data = { name, description };
  nullEmptyStrings(data);

  return createGroup(id, data);
}

export async function svcSetDefaultGroup(id: number) {
  const { id: userId } = await withUser();
  if (typeof id !== "number") err();

  await db
    .update(users)
    .set({ defaultGroupId: id })
    .where(eq(users.id, userId));
}

export async function svcRemoveInviteLink(groupId: number) {
  const { id: userId } = await withUser();
  if (typeof groupId !== "number") err();

  const group = await updateGroup(userId, groupId, { uuid: null });
  if (!group) err(404);

  return group;
}

export async function svcGenerateInviteLink(groupId: number) {
  const { id: userId } = await withUser();
  if (typeof groupId !== "number") err();

  const group = await updateGroup(userId, groupId, { uuid: uuidv4() });
  if (!group) err(404);

  return group;
}

export async function createGroup(
  ownerId: number,
  data: Pick<TCrGroup, "name" | "description">
) {
  return await atomic(
    { operation: "creating new group", revisedBy: ownerId },
    async (tx, revisionId) => {
      const [{ groupId }] = await tx
        .insert(groups)
        .values({
          ...data,
          revisionId,
        })
        .returning({
          groupId: groups.id,
        });

      await tx.insert(memberships).values({
        userId: ownerId,
        groupId,
        revisionId,
      });

      return await tx.query.groups.findFirst({
        ...COLS_WITH,
        where: eq(groups.id, groupId),
      });
    }
  );
}

export async function addMember(groupId: number, userId: number) {
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

export async function joinGroup(uuid: string, userId: number) {
  const group = await db.query.groups.findFirst({
    where: (t, o) => o.eq(t.uuid, uuid),
  });
  if (!group) err("link expired");

  const ms = await db.query.memberships.findFirst({
    where: (t, o) => o.and(o.eq(t.userId, userId), eq(t.groupId, group.id)),
  });
  if (ms) err("already a member");

  return await addMember(group.id, userId);
}

export async function getGroups(userId: number) {
  const res = (await db.query.groups.findMany({
    ...COLS_WITH,
    where: exists(
      db
        .select({ x: sql`1` })
        .from(memberships)
        .where(
          and(
            eq(memberships.groupId, groups.id),
            eq(memberships.userId, userId),
            isActive(memberships)
          )
        )
    ),
  })) as TGroup[];

  res.sort(sortByName);
  res.forEach((grp) =>
    grp.memberships!.sort((a, b) => sortByName(a.user!, b.user!))
  );

  return res;
}

export async function updateGroup(
  adminId: number,
  groupId: number,
  modifier: Pick<TGroup, "name" | "description" | "flags" | "uuid">
) {
  return await atomic(
    { operation: "Updating group", revisedBy: adminId },
    async (tx, revisionId) => {
      const group = await tx.query.groups.findFirst({
        where: (t, o) => o.eq(t.id, groupId),
      });
      if (!group) return null;

      const saving = await updater(group, modifier, {
        tx,
        tableName: "groups",
        entityPk1: groupId,
        revisionId,
        skipArchivalOf: ["uuid"],
      });

      if (saving) {
        await tx.update(groups).set(group).where(eq(groups.id, group.id));

        const res = (await tx.query.groups.findFirst({
          ...COLS_WITH,
          where: eq(groups.id, groupId),
        })) as TGroup;

        res.memberships!.sort((a, b) => sortByName(a.user!, b.user!));

        return res;
      } else err("No changes were made");
    }
  );
}
