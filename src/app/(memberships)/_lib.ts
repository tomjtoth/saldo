"use server";

import { and, eq, isNull, sql } from "drizzle-orm";

import { atomic, db, DbMembership, modEntity } from "@/app/_lib/db";
import { apiInternal, be } from "@/app/_lib/utils";
import { categories, chartColors, memberships } from "@/app/_lib/db/schema";
import { currentUser, User } from "../(users)/_lib";
import { Membership } from "../groups/_lib/getGroups";
import { svcCheckUserAccessToCategory } from "../categories/_lib";
import { Category } from "../categories/_lib";
import { svcCheckUserAccessToGroup } from "../groups/_lib";

export type MembershipModifier = Pick<
  DbMembership,
  "groupId" | "userId" | "flags"
>;

export async function apiModMembership({
  groupId,
  userId,
  flags,
}: MembershipModifier) {
  return apiInternal(async () => {
    be.number(groupId, "group ID");
    be.number(userId, "user ID");
    be.number(flags, "flags");

    const user = await currentUser();

    await svcCheckUserAccessToGroup(userId, groupId, true);

    return await svcModMembership(user.id, { groupId, userId, flags });
  });
}

export async function svcModMembership(
  revisedBy: User["id"],
  {
    userId,
    groupId,
    ...modifier
  }: Pick<DbMembership, "groupId" | "userId"> &
    Partial<Pick<DbMembership, "flags" | "defaultCategoryId">>
) {
  return await atomic(
    { operation: "Updating membership", revisedBy },
    async (tx, revisionId) => {
      const [ms] = await tx.query.memberships.findMany({
        where: and(
          eq(memberships.userId, userId),
          eq(memberships.groupId, groupId)
        ),
      });

      const res = await modEntity(ms, modifier, {
        tx,
        tableName: "memberships",
        primaryKeys: { userId: true, groupId: true },
        revisionId,
        skipArchivalOf: { defaultCategoryId: true },
        needsToReturn: true,
      });

      return res;
    }
  );
}

export async function apiSetDefaultCategory(categoryId: Category["id"]) {
  return apiInternal(async () => {
    be.number(categoryId, "category ID");

    const { id: userId } = await currentUser();

    await svcCheckUserAccessToCategory(userId, categoryId);

    const cat = await db.query.categories.findFirst({
      columns: { groupId: true },
      where: eq(categories.id, categoryId),
    });

    await svcModMembership(userId, {
      userId,
      groupId: cat!.groupId,
      defaultCategoryId: categoryId,
    });
  });
}

type TSetUsercolor = {
  color: string | null;
  groupId?: Membership["groupId"] | null;
  memberId?: Membership["userId"] | null;
};

export async function apiSetUserColor({
  color,
  groupId,
  memberId,
}: TSetUsercolor) {
  return apiInternal(async () => {
    be.stringOrNull(color, "color");
    be.numberNullOrUndefined(groupId, "group id");
    be.numberNullOrUndefined(memberId, "member id");

    groupId = groupId ?? null;
    memberId = memberId ?? null;

    const user = await currentUser();

    return await svcSetUserColor(user.id, { color, groupId, memberId });
  });
}

async function svcSetUserColor(
  userId: User["id"],
  { color, groupId, memberId }: Required<TSetUsercolor>
) {
  const conditions = and(
    eq(chartColors.userId, userId),

    groupId === null
      ? isNull(chartColors.groupId)
      : eq(chartColors.groupId, groupId),

    memberId === null
      ? isNull(chartColors.memberId)
      : eq(chartColors.memberId, memberId)
  );

  const exists = await db
    .select({ x: sql`1` })
    .from(chartColors)
    .where(conditions);

  if (color === null) {
    await db.delete(chartColors).where(conditions);
  } else {
    if (exists.length) {
      await db.update(chartColors).set({ color }).where(conditions);
    } else {
      await db.insert(chartColors).values({ userId, groupId, memberId, color });
    }
  }
}
