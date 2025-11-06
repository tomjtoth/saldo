"use server";

import { and, eq, isNull, sql } from "drizzle-orm";

import { atomic, db, TCrMembership, TMembership, updater } from "@/app/_lib/db";
import { err } from "@/app/_lib/utils";
import { chartColors, memberships } from "@/app/_lib/db/schema";
import { currentUser } from "@/app/_lib/services";
import wrapService from "../_lib/wrapService";

export async function svcUpdateMembership({
  groupId,
  userId,
  flags,
}: TMembership) {
  const { id: revisedBy } = await currentUser();
  if (
    typeof groupId !== "number" ||
    typeof userId !== "number" ||
    typeof flags !== "number"
  )
    err();

  if (!(await isAdmin(revisedBy, groupId))) err(403);

  const ms = await updateMembership(revisedBy, {
    groupId,
    userId,
    flags,
  });

  if (!ms) err(404);

  return ms;
}

type MembershipUpdater = Pick<TCrMembership, "groupId" | "userId"> &
  Pick<TMembership, "flags" | "defaultCategoryId">;

export async function updateMembership(
  revisedBy: number,
  { userId, groupId, ...modifier }: MembershipUpdater
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

      if (!ms) return null;

      const saving = await updater(ms, modifier, {
        tx,
        tableName: "memberships",
        entityPk1: userId,
        entityPk2: groupId,
        revisionId,
        skipArchivalOf: ["defaultCategoryId"],
      });

      if (saving) {
        const [res] = await tx
          .update(memberships)
          .set(ms)
          .where(
            and(
              eq(memberships.userId, userId),
              eq(memberships.groupId, groupId)
            )
          )
          .returning({ flags: memberships.flags });

        return res as TMembership;
      } else err("No changes were made");
    }
  );
}

export async function isAdmin(userId: number, groupId: number) {
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
  color: string;
  groupId?: number | null;
  memberId?: number | null;
};

function validateSetUserColorData({ color, groupId, memberId }: TSetUsercolor) {
  if (typeof color !== "string") err(400, "color should be string");

  const typeGID = typeof groupId;
  if (groupId !== null && typeGID !== "number" && typeGID !== "undefined")
    err(400, "groupId should be an optional number");

  const typeMID = typeof memberId;
  if (memberId !== null && typeMID !== "number" && typeMID !== "undefined")
    err(400, "memberId should be an optional number");

  groupId = groupId ?? null;
  memberId = memberId ?? null;

  return { color, groupId, memberId };
}

export const svcSetUserColor = wrapService(
  setUserColor,
  validateSetUserColorData
);

async function setUserColor(
  userId: number,
  { color, groupId, memberId }: Required<TSetUsercolor>
) {
  const conditions = and(
    eq(chartColors.userId, userId),
    groupId ? eq(chartColors.groupId, groupId) : isNull(chartColors.groupId),
    memberId ? eq(chartColors.memberId, memberId) : isNull(chartColors.memberId)
  );

  const exists = await db
    .select({ x: sql`1` })
    .from(chartColors)
    .where(conditions);

  if (exists.length) {
    await db.update(chartColors).set({ color }).where(conditions);
  } else {
    await db.insert(chartColors).values({ userId, groupId, memberId, color });
  }
}
