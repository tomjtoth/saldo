"use server";

import { and, eq, isNull, sql } from "drizzle-orm";

import { atomic, db, DbMembership, modEntity } from "@/app/_lib/db";
import { err } from "@/app/_lib/utils";
import { categories, chartColors, memberships } from "@/app/_lib/db/schema";
import { currentUser, User } from "../(users)/_lib";
import { Group, Membership } from "../groups/_lib/getGroups";
import { userMayModCategory } from "../categories/_lib/common";
import { Category } from "../categories/_lib";

export type MembershipModifier = Pick<
  DbMembership,
  "groupId" | "userId" | "flags"
>;

export async function apiModMembership({
  groupId,
  userId,
  flags,
}: MembershipModifier) {
  if (
    typeof groupId !== "number" ||
    typeof userId !== "number" ||
    typeof flags !== "number"
  )
    err();

  const user = await currentUser();

  if (!(await isAdmin(user.id, groupId))) err(403);

  return await svcModMembership(user.id, { groupId, userId, flags });
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
      const ms = await tx.query.memberships.findFirst({
        where: and(
          eq(memberships.userId, userId),
          eq(memberships.groupId, groupId)
        ),
      });

      if (!ms) err(404);

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
  if (typeof categoryId !== "number") err();

  const { id: userId } = await currentUser();

  await userMayModCategory(userId, categoryId);

  const cat = await db.query.categories.findFirst({
    columns: { groupId: true },
    where: eq(categories.id, categoryId),
  });

  await svcModMembership(userId, {
    userId,
    groupId: cat!.groupId,
    defaultCategoryId: categoryId,
  });
}

export async function isAdmin(userId: User["id"], groupId: Group["id"]) {
  const ms = await db
    .select({ x: sql`1` })
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.groupId, groupId),
        sql`${memberships.flags} & 2 = 2`
      )
    );

  return !!ms;
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
  if (color !== null && typeof color !== "string")
    err(400, "color should be string");

  const typeGID = typeof groupId;
  if (groupId !== null && typeGID !== "number" && typeGID !== "undefined")
    err(400, "groupId should be an optional number");

  const typeMID = typeof memberId;
  if (memberId !== null && typeMID !== "number" && typeMID !== "undefined")
    err(400, "memberId should be an optional number");

  groupId = groupId ?? null;
  memberId = memberId ?? null;

  const user = await currentUser();

  return await svcSetUserColor(user.id, { color, groupId, memberId });
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
