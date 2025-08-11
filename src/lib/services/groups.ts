import { atomic, db, Group, TGroup } from "@/lib/db";
import { err, sortByName } from "../utils";
import { updater } from "../db/updater";

import { Prisma } from "@prisma/client";

const GROUP_SELECT = Prisma.validator<Prisma.GroupSelect>()({
  id: true,
  name: true,
  description: true,
  statusId: true,
  uuid: true,
  memberships: {
    select: {
      statusId: true,
      user: {
        select: { name: true, id: true, email: true, statusId: true },
      },
    },
  },
});

export async function createGroup(
  ownerId: number,
  data: Pick<Prisma.GroupCreateInput, "name" | "description">
) {
  return await atomic(
    { operation: "creating new group", revisedBy: ownerId },
    async (tx, rev) => {
      return await tx.group.create({
        select: GROUP_SELECT,
        data: {
          ...data,
          memberships: {
            create: { userId: ownerId, revisionId: rev.id!, statusId: 2 },
          },
          revisionId: rev.id!,
        },
      });
    }
  );
}

export async function addMember(groupId: number, userId: number) {
  return await atomic(
    { operation: "adding new member", revisedBy: userId },
    async (tx, rev) => {
      await tx.group.update({ data: { uuid: null }, where: { id: groupId } });

      return await tx.membership.create({
        data: { userId, groupId, revisionId: rev.id! },
      });
    }
  );
}

export async function joinGroup(uuid: string, userId: number) {
  const group = await db.group.findFirst({ where: { uuid } });
  if (!group) err("link expired");

  const ms = await db.membership.findFirst({
    where: { userId, groupId: group.id },
  });
  if (ms) err("already a member");

  return await addMember(group.id, userId);
}

export async function getGroups(userId: number) {
  const groups = await db.group.findMany({
    select: GROUP_SELECT,
    where: {
      memberships: { some: { userId, statusId: { in: [0, 2] } } },
    },
  });

  groups.sort(sortByName);
  groups.forEach((grp) =>
    grp.memberships.sort((a, b) => sortByName(a.user, b.user))
  );

  return groups;
}

export type GroupUpdater = Pick<Group, "id"> &
  Partial<Pick<TGroup, "name" | "description" | "statusId" | "uuid">>;

export async function updateGroup(
  adminId: number,
  groupId: number,
  modifier: Partial<Pick<Group, "name" | "description" | "statusId" | "uuid">>
) {
  return await atomic(
    { operation: "Updating group", revisedBy: adminId },
    async (tx, rev) => {
      const group = await tx.group.findUnique({ where: { id: groupId } });
      if (!group) return null;

      const saving = await updater(group, modifier, {
        tx,
        tableName: "Group",
        entityPk1: groupId,
        revisionId: rev.id!,
        skipArchivalOf: ["uuid"],
      });

      if (saving) {
        const res = await tx.group.update({
          select: GROUP_SELECT,
          where: { id: groupId },
          data: group,
        });

        res.memberships.sort((a, b) => sortByName(a.user, b.user));

        return res;
      } else err("No changes were made");
    }
  );
}
