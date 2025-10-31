"use server";

import { eq, exists, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { err, nullEmptyStrings, sortByName } from "../utils";
import { updater } from "../db/updater";
import { atomic, db, isActive, TCrGroup, TGroup } from "../db";
import { groups, memberships, users } from "../db/schema";
import { currentUser } from "./users";
import wrapService from "../wrapService";

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

function validateCreateGroupData({
  name,
  description,
}: Required<Pick<TGroup, "name">> & Pick<TGroup, "description">) {
  if (
    typeof name !== "string" ||
    (description !== null &&
      !["string", "undefined"].includes(typeof description))
  )
    err();

  const data = { name, description };

  nullEmptyStrings(data);

  return data;
}

export const svcCreateGroup = wrapService(createGroup, validateCreateGroupData);

function validateUpdateGroupData({
  id,
  flags,
  name,
  description,
}: Pick<TGroup, "name" | "description" | "flags"> &
  Required<Pick<TGroup, "id">>) {
  if (
    typeof id !== "number" ||
    !["number", "undefined"].includes(typeof flags) ||
    !["string", "undefined"].includes(typeof name) ||
    (description !== null &&
      !["string", "undefined"].includes(typeof description))
  )
    err();

  const data = {
    flags,
    name,
    description,
  };

  nullEmptyStrings(data);

  return { id, ...data };
}

export const svcUpdateGroup = wrapService(updateGroup, validateUpdateGroupData);

export async function svcSetDefaultGroup(id: number) {
  const { id: userId } = await currentUser();
  if (typeof id !== "number") err();

  await db
    .update(users)
    .set({ defaultGroupId: id })
    .where(eq(users.id, userId));
}

export async function svcRemoveInviteLink(groupId: number) {
  const { id: userId } = await currentUser();
  if (typeof groupId !== "number") err();

  const group = await updateGroup(userId, { id: groupId, uuid: null });

  return group;
}

export async function svcGenerateInviteLink(groupId: number) {
  const { id: userId } = await currentUser();
  if (typeof groupId !== "number") err();

  const group = await updateGroup(userId, { id: groupId, uuid: uuidv4() });

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
        flags: 3,
        groupId,
        revisionId,
      });

      const res = await tx.query.groups.findFirst({
        ...COLS_WITH,
        where: eq(groups.id, groupId),
      });

      return res as TGroup;
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

  return await addMember(group.id, userId);
}

export async function getGroups(userId: number) {
  const res: TGroup[] = await db.query.groups.findMany({
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
  });

  res.sort(sortByName);
  res.forEach((grp) =>
    grp.memberships!.sort((a, b) => sortByName(a.user!, b.user!))
  );

  return res;
}

export async function updateGroup(
  adminId: number,
  {
    id,
    ...modifier
  }: Pick<TGroup, "name" | "description" | "flags" | "uuid"> &
    Required<Pick<TGroup, "id">>
) {
  return await atomic(
    { operation: "Updating group", revisedBy: adminId },
    async (tx, revisionId) => {
      const group = await tx.query.groups.findFirst({
        where: eq(groups.id, id),
      });

      if (!group) err(404);

      const saving = await updater(group, modifier, {
        tx,
        tableName: "groups",
        entityPk1: id,
        revisionId,
        skipArchivalOf: ["uuid"],
      });

      if (saving) {
        await tx.update(groups).set(group).where(eq(groups.id, group.id));

        const res = (await tx.query.groups.findFirst({
          ...COLS_WITH,
          where: eq(groups.id, id),
        })) as TGroup;

        res.memberships!.sort((a, b) => sortByName(a.user!, b.user!));

        return res;
      } else err("No changes were made");
    }
  );
}
