import {
  atomic,
  Membership,
  MembershipArchive,
  Revision,
  TMembership,
} from "../models";
import { err } from "../utils";

type MembershipUpdater = Pick<TMembership, "groupId" | "userId"> &
  Partial<Pick<TMembership, "admin" | "statusId" | "defaultCatId">>;

export async function updateMembership(
  revBy: number,
  { userId, groupId, statusId, admin, defaultCatId }: MembershipUpdater
) {
  return await atomic("Updating membership", async (transaction) => {
    const ms = await Membership.findOne({
      where: { userId, groupId },
      transaction,
    });
    if (!ms) return null;

    const preChanges = ms.get({ plain: true, clone: true });
    let saving = false;

    if (statusId !== undefined && statusId !== ms.statusId) {
      saving = true;
      ms.statusId = statusId;
    }

    if (admin !== undefined && admin !== ms.admin) {
      saving = true;
      ms.admin = admin;
    }

    if (defaultCatId !== undefined && defaultCatId !== ms.defaultCatId) {
      saving = true;
      ms.defaultCatId = defaultCatId;
    }

    if (saving) {
      await MembershipArchive.create(preChanges, { transaction });
      const rev = await Revision.create({ revBy }, { transaction });
      ms.revId = rev.id;
      await ms.save({ transaction });
    } else err("No changes were made");

    return await ms.reload({
      attributes: ["admin", "statusId"],
      transaction,
    });
  });
}

export async function isAdmin(userId: number, groupId: number) {
  const ms = await Membership.findOne({
    where: { userId, groupId, admin: true },
  });

  return !!ms;
}
