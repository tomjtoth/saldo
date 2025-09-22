"use server";

import { atomic, db, TCrMembership, TMembership, updater } from "@/lib/db";
import { err } from "../utils";
import { and, eq, sql } from "drizzle-orm";
import { memberships } from "../db/schema";
import { currentUser } from "./users";

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

export async function svcSetChartStyle(
  groupId: number,
  userId: number,
  style: string | null
) {
  const { id } = await currentUser();

  await db
    .update(memberships)
    .set({
      chartStyle: sql`coalesce(
        json_set(${memberships.chartStyle}, ${`$.${userId}`}, ${style}),
        json_object(${userId.toString()}, ${style})
      )`,
    })
    .where(and(eq(memberships.groupId, groupId), eq(memberships.userId, id)));
}
