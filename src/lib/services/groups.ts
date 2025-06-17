import { col, fn, Op } from "sequelize";

import {
  atomic,
  Group,
  GroupArchive,
  Membership,
  Revision,
  TCrGroup,
  User,
} from "../models";

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
          attributes: ["admin"],
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
    where: { userId },
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
        through: { attributes: ["admin"] },
      },
    ],
    order: [fn("LOWER", col("Group.name"))],
  });
}
