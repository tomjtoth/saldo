import { err, sortByName } from "../utils";
import { updater } from "../db/updater";
import { atomic, TCrGroup } from "../db";
import { groups, memberships } from "../db/schema";
import { eq } from "drizzle-orm";

const GROUP_SELECT = {
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
};

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
        columns: {
          id: true,
          name: true,
          description: true,
          statusId: true,
          uuid: true,
        },

        with: {
          memberships: {
            columns: {
              statusId: true,
            },
            with: {
              user: {
                columns: { name: true, id: true, email: true, statusId: true },
              },
            },
          },
        },
        where: (t, o) => o.eq(t.id, groupId),
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
