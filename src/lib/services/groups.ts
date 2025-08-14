import { eq, exists, and, sql } from "drizzle-orm";

import { err, sortByName } from "../utils";
import { updater } from "../db/updater";
import { atomic, db, TCrGroup, TGroup } from "../db";
import { groups, memberships } from "../db/schema";

const COLS_WITH = {
  columns: {
    id: true,
    name: true,
    description: true,
    statusId: true,
    uuid: true,
  },
  with: {
    memberships: {
      columns: { statusId: true },
      with: {
        user: {
          columns: { name: true, id: true, email: true, statusId: true },
        },
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
        ...COLS_WITH,
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
        .select({ userId: memberships.userId })
        .from(memberships)
        .where(
          and(
            eq(memberships.groupId, groups.id),
            eq(memberships.userId, userId),
            sql`${memberships.statusId} & 1 = 1`
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
  modifier: Pick<TGroup, "name" | "description" | "statusId" | "uuid">
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
        tableName: "Group",
        entityPk1: groupId,
        revisionId,
        skipArchivalOf: ["uuid"],
      });

      if (saving) {
        await tx.update(groups).set(group);

        const res = (await tx.query.groups.findFirst({
          ...COLS_WITH,
          where: (t, o) => o.eq(t.id, groupId),
        })) as TGroup;

        res.memberships!.sort((a, b) => sortByName(a.user!, b.user!));

        return res;
      } else err("No changes were made");
    }
  );
}
