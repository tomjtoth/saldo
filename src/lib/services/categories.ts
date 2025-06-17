import { col, fn, Op } from "sequelize";

import {
  atomic,
  Category,
  CategoryArchive,
  Group,
  Membership,
  Revision,
  TCategory,
  TCrCategory,
  User,
} from "../models";
import { err } from "../utils";

export type TCategoryUpdater = Partial<
  Pick<TCategory, "name" | "description" | "statusId">
>;

export async function createCategory(revBy: number, data: TCrCategory) {
  return await atomic("Creating category", async (transaction) => {
    const rev = await Revision.create({ revBy }, { transaction });
    const cat = await Category.create(
      {
        revId: rev.id,
        ...data,
      },
      { transaction }
    );

    await cat.reload({
      transaction,
      include: [
        {
          model: Revision,
          attributes: ["revOn"],
          include: [{ model: User, attributes: ["name"] }],
        },
        {
          model: CategoryArchive,
          as: "archives",
          include: [
            {
              model: Revision,
              attributes: ["revOn"],
              include: [{ model: User, attributes: ["name"] }],
            },
          ],
        },
      ],
    });

    return cat;
  });
}

export async function updateCategory(
  id: number,
  revBy: number,
  data: TCategoryUpdater
) {
  return await atomic("Updating category", async (transaction) => {
    let noChanges = true;

    const cat = await Category.findByPk(id, { transaction });

    if (!cat) return null;

    await CategoryArchive.create(cat.get({ plain: true }), { transaction });

    if (data.name !== undefined && cat.name !== data.name) {
      cat.name = data.name;
      noChanges = false;
    }

    if (
      data.description !== undefined &&
      cat.description !== data.description
    ) {
      cat.description = data.description;
      noChanges = false;
    }

    if (data.statusId !== undefined && cat.statusId !== data.statusId) {
      cat.statusId = data.statusId;
      noChanges = false;
    }

    if (noChanges) err("no changes in category, rolling back");
    else {
      const rev = await Revision.create({ revBy }, { transaction });
      cat.revId = rev.id;
      await cat.save({ transaction });
    }

    return await cat.reload({
      transaction,
      include: [
        {
          model: Revision,
          attributes: ["revOn"],
          include: [{ model: User, attributes: ["name"] }],
        },
        {
          model: CategoryArchive,
          as: "archives",
          include: [
            {
              model: Revision,
              attributes: ["revOn"],
              include: [{ model: User, attributes: ["name"] }],
            },
          ],
        },
      ],
    })!;
  });
}

export async function getCatsOf(
  userId: number,
  { idsOnly = false, forReceipts = false } = {}
) {
  const relatedToUser = {
    model: Group,
    attributes: [],
    include: [{ model: Membership, attributes: [], where: { userId } }],
  };

  if (idsOnly) {
    return await Category.findAll({
      attributes: ["id"],
      include: [relatedToUser],
    });
  }

  if (forReceipts) {
    return await Category.findAll({
      attributes: ["id", "name"],
      include: [relatedToUser],
      where: { statusId: { [Op.eq]: 1 } },
      order: [[fn("LOWER", col("Category.name")), "ASC"]],
    });
  }

  return await Category.findAll({
    include: [
      relatedToUser,
      {
        model: Revision,
        attributes: ["revOn"],
        include: [{ model: User, attributes: ["name"] }],
      },
      {
        model: CategoryArchive,
        as: "archives",
        include: [
          {
            model: Revision,
            attributes: ["revOn"],
            include: [{ model: User, attributes: ["name"] }],
          },
        ],
      },
    ],
    order: [[fn("LOWER", col("Category.name")), "ASC"]],
  });
}
