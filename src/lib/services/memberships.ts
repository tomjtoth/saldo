import { atomic, db, Membership, TMembership, updater } from "@/lib/db";
import { err, status } from "../utils";

type MembershipUpdater = Pick<Membership, "groupId" | "userId"> &
  Pick<TMembership, "statusId" | "defaultCategoryId">;

export async function updateMembership(
  revisedBy: number,
  { userId, groupId, ...modifier }: MembershipUpdater
) {
  return await atomic(
    { operation: "Updating membership", revisedBy },
    async (tx, rev) => {
      const ms = await tx.membership.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!ms) return null;

      const saving = await updater(ms, modifier, {
        tx,
        tableName: "Membership",
        entityPk1: userId,
        entityPk2: groupId,
        revisionId: rev.id!,
      });

      if (saving)
        return await tx.membership.update({
          select: { statusId: true },
          data: ms,
          where: { userId_groupId: { userId, groupId } },
        });
      else err("No changes were made");
    }
  );
}

export async function isAdmin(userId: number, groupId: number) {
  const ms = await db.membership.findUnique({
    where: { userId_groupId: { userId, groupId } },
  });

  return !!ms && status(ms).admin;
}
