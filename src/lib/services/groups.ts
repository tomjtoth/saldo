import { col, fn } from "sequelize";

import {
  atomic,
  Group,
  GroupArchive,
  Membership,
  Revision,
  TCrGroup,
  TGroup,
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
          through: { attributes: ["admin", "statusId"] },
        },
      ],
    });
  });
}

export async function addMember(groupId: number, userId: number) {
  return await atomic("adding new member", async (transaction) => {
    const rev = await Revision.create({ revBy: userId }, { transaction });

    const group = await Group.findByPk(groupId, { transaction });
    await group!.update(
      { uuid: null },
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
  if (!group) err("link expired");

  const ms = await Membership.findOne({
    where: { userId, groupId: group.id },
  });
  if (ms) err("already a member");

  return await addMember(group.id, userId);
}

export async function getGroups(userId: number) {
  return await Group.findAll({
    include: [
      {
        model: Membership,
        where: { userId, statusId: 1 },
        attributes: ["admin"],
      },
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
    } else err("No changes were made");

    return await group.reload({
      transaction,
      include: [
        {
          model: Membership,
          where: { userId: adminId, statusId: 1 },
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
