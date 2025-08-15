import { atomic, db, TCrMembership, TMembership, updater } from "@/lib/db";
import { err } from "../utils";
import { and, eq, sql } from "drizzle-orm";
import { memberships } from "../db/schema";

type MembershipUpdater = Pick<TCrMembership, "groupId" | "userId"> &
  Pick<TMembership, "statusId" | "defaultCategoryId">;

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
          .returning({ statusId: memberships.statusId });

        return res;
      } else err("No changes were made");
    }
  );
}

export async function isAdmin(userId: number, groupId: number) {
  const ms = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.groupId, groupId),
        sql`${memberships.statusId} & 2 = 2`
      )
    );

  return !!ms;
}
