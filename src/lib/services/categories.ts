import { Op } from "sequelize";

import {
  atomic,
  Category,
  CategoryArchive,
  Item,
  ItemShare,
  Revision,
  TCrCategory,
} from "../models";
import { err } from "../utils";

export type TCategoryUpdater = {
  description?: string;
  statusId?: number;
};

export async function createCategory(revBy: number, data: TCrCategory) {
  return await atomic("Creating category", async (transaction) => {
    const rev = await Revision.create({ revBy }, { transaction });
    const cat = await Category.create(
      {
        revId: rev.id,
        description: data.description,
      },
      {
        transaction,
        include: [
          Revision,
          {
            model: CategoryArchive,
            as: "archives",
            include: [Revision],
          },
        ],
      }
    );

    return cat;
  });
}

export async function updateCategory(
  id: number,
  revBy: number,
  data: TCategoryUpdater
) {
  return await atomic("Updating category", async (transaction) => {
    let changedOriginal = false;

    const cat = await Category.findByPk(id, { transaction });

    if (!cat) return null;

    await CategoryArchive.create(cat.get({ plain: true }), { transaction });

    const rev = await Revision.create({ revBy }, { transaction });
    cat.revId = rev.id;

    if (
      data.description !== undefined &&
      cat.description !== data.description
    ) {
      cat.description = data.description;
      changedOriginal = true;
    }

    if (data.statusId !== undefined && cat.statusId !== data.statusId) {
      cat.statusId = data.statusId;
      changedOriginal = true;
    }

    if (changedOriginal) await cat.save({ transaction });
    else err("nothing changed");

    return await Category.findByPk(id, {
      transaction,
      include: [
        Revision,
        { model: CategoryArchive, as: "archives", include: [Revision] },
      ],
    })!;
  });
}

export async function findUsersCatIds(userId: number) {
  const catIds = await Category.findAll({
    attributes: ["id"],
    include: [
      {
        model: Item,
        include: [
          {
            model: ItemShare,
            as: "shares",
            where: { userId },
            attributes: [],
          },
        ],
        attributes: [],
      },
      { model: Revision, attributes: [] },
      {
        model: CategoryArchive,
        as: "archives",
        include: [{ model: Revision, attributes: [] }],
      },
    ],
    where: {
      [Op.or]: [
        // Used by this user (via ItemShare)
        { "$Items.shares.user_id$": userId },
        // Category revision by this user
        { "$Revision.rev_by$": userId },
        // Archive revision by this user
        { "$archives.Revision.rev_by$": userId },
      ],
    },
  });

  return catIds.map((cat) => cat.id);
}
