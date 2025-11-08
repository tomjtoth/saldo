"use server";

import { eq, exists, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { err, nullEmptyStrings, sortByName } from "@/app/_lib/utils";
import { updater } from "@/app/_lib/db/updater";
import { atomic, db, isActive, TCrGroup, TGroup } from "@/app/_lib/db";
import { groups, memberships, users } from "@/app/_lib/db/schema";
import { currentUser } from "@/app/(users)/_lib";

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

export async function apiAddGroup({
  name,
  description,
}: Required<Pick<TGroup, "name">> & Pick<TGroup, "description">) {
  const typeDescr = typeof description;

  if (
    typeof name !== "string" ||
    (description !== null &&
      typeDescr !== "string" &&
      typeDescr !== "undefined")
  )
    err();

  const data = { name, description };

  nullEmptyStrings(data);

  const user = await currentUser();

  return await svcAddGroup(user.id, data);
}

export async function svcAddGroup(
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

export async function svcGetGroups(userId: number) {
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

type GroupModifier = Required<Pick<TGroup, "id">> &
  Pick<TGroup, "name" | "description" | "flags" | "uuid">;

export async function apiModGroup({
  id,
  flags,
  name,
  description,
}: Omit<GroupModifier, "uuid">) {
  const typeDescr = typeof description;
  const typeFlags = typeof flags;
  const typeName = typeof name;

  if (
    typeof id !== "number" ||
    (typeFlags !== "number" && typeFlags !== "undefined") ||
    (typeName !== "string" && typeName !== "undefined") ||
    (description !== null &&
      typeDescr !== "string" &&
      typeDescr !== "undefined")
  )
    err();

  const user = await currentUser();

  const data = {
    id,
    flags,
    name,
    description,
  };

  nullEmptyStrings(data);

  return await svcModGroup(user.id, data);
}

export async function apiSetDefaultGroup(id: number) {
  if (typeof id !== "number") err();

  const { id: userId } = await currentUser();

  await db
    .update(users)
    .set({ defaultGroupId: id })
    .where(eq(users.id, userId));
}

export async function apiRmInviteLink({ id }: Pick<GroupModifier, "id">) {
  if (typeof id !== "number") err(400);

  const user = await currentUser();

  return svcModGroup(user.id, { id, uuid: null });
}

export async function apiGenInviteLink({ id }: Pick<GroupModifier, "id">) {
  if (typeof id !== "number") err(400);

  const user = await currentUser();

  return await svcModGroup(user.id, { id, uuid: uuidv4() });
}

export async function svcModGroup(
  revisedBy: number,
  { id, ...modifier }: GroupModifier
) {
  return await atomic(
    { operation: "Updating group", revisedBy },
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
