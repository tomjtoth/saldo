import { col, fn, Op } from "sequelize";

import {
  atomic,
  Group,
  GroupArchive,
  Membership,
  MembershipArchive,
  Revision,
  TCrGroup,
  TGroup,
  TMembership,
  User,
} from "../models";
import { err } from "../utils";

export async function createGroup(ownerId: number, data: TCrGroup) {
  return await atomic("creating new group", async (transaction) => {
    const rev = await Revision.create({ revBy: ownerId }, { transaction });
    const group = await Group.create(
      { ...data, revId: rev.id },
      { transaction }
    );

    await Membership.create(
      {
        groupId: group.id,
        userId: ownerId,
        revId: rev.id,
        admin: true,
      },
      { transaction }
    );

    return await group.reload({
      transaction,
      include: [
        {
          model: Membership,
          attributes: ["admin", "statusId"],
        },
        {
          model: User,
          through: { attributes: ["admin"] },
        },
      ],
      order: [fn("LOWER", col("Group.name"))],
    });
  });
}

export async function addMember(groupId: number, userId: number) {
  return await atomic("adding new member", async (transaction) => {
    const rev = await Revision.create({ revBy: userId }, { transaction });

    const group = (await Group.findByPk(groupId, { transaction }))!;
    await GroupArchive.create(group.get({ plain: true }), { transaction });

    group.update(
      { uuid: null, revId: rev.id },
      { transaction, where: { id: groupId } }
    );

    return await Membership.create(
      { userId, groupId, revId: rev.id },
      { transaction }
    );
  });
}

export async function joinGroup(uuid: string, userId: number) {
  const group = await Group.findOne({ where: { uuid } });
  if (!group) return null;

  return await addMember(group.id, userId);
}

export async function getGroupsOf(
  userId: number,
  { idsOnly = false, forCategories = false } = {}
) {
  const relatedToUser = {
    model: Membership,
    where: { [Op.and]: [{ userId }, { statusId: { [Op.eq]: 1 } }] },
    attributes: !idsOnly && !forCategories ? ["admin"] : [],
  };

  if (idsOnly) {
    return await Group.findAll({
      attributes: ["id"],
      include: [relatedToUser],
    });
  }

  if (forCategories) {
    return await Group.findAll({
      attributes: ["id", "name"],
      include: [relatedToUser],
      where: { statusId: { [Op.eq]: 1 } },
    });
  }

  return await Group.findAll({
    include: [
      relatedToUser,
      {
        model: User,
        through: { attributes: ["admin", "statusId"] },
      },
    ],
    order: [fn("LOWER", col("Group.name"))],
  });
}

export type GroupUpdater = Pick<TGroup, "id"> &
  Partial<Pick<TGroup, "name" | "description" | "statusId" | "uuid">>;

export async function updateGroup(
  adminId: number,
  { id, statusId, name, description, uuid }: GroupUpdater
) {
  return await atomic("Updating group", async (transaction) => {
    const group = await Group.findByPk(id);
    if (!group) return null;

    const preChanges = group.get({ plain: true, clone: true });
    let archiving = false;
    let linkChanged = false;

    if (statusId !== undefined && statusId !== group.statusId) {
      archiving = true;
      group.statusId = statusId;
    }

    if (name !== undefined && name !== group.name) {
      archiving = true;
      group.name = name;
    }

    if (description !== undefined && description !== group.description) {
      archiving = true;
      group.description = description;
    }

    if (uuid !== undefined && uuid !== group.uuid) {
      linkChanged = true;
      group.uuid = uuid;
    }

    if (archiving || linkChanged) {
      if (archiving) {
        await GroupArchive.create(preChanges, { transaction });
        const rev = await Revision.create({ revBy: adminId }, { transaction });
        group.revId = rev.id;
      }
      await group.save({ transaction });
    } else err("No changes were made!");

    return await group.reload({
      transaction,
      include: [
        {
          model: Membership,
          where: {
            [Op.and]: [{ userId: adminId }, { statusId: { [Op.eq]: 1 } }],
          },
        },
        {
          model: User,
          through: { attributes: ["admin", "statusId"] },
        },
      ],
      order: [fn("LOWER", col("Users.name"))],
    });
  });
}

type MembershipUpdater = Pick<TMembership, "groupId" | "userId"> &
  Partial<Pick<TMembership, "admin" | "statusId">>;

export async function updateMembership(
  revBy: number,
  { userId, groupId, statusId, admin }: MembershipUpdater
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

    if (saving) {
      await MembershipArchive.create(preChanges, { transaction });
      const rev = await Revision.create({ revBy }, { transaction });
      ms.revId = rev.id;
      await ms.save({ transaction });
    } else err("No changes were made!");

    return await ms.reload({
      attributes: ["admin", "statusId"],
      transaction,
    });
  });
}
