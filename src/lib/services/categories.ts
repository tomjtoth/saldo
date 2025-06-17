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
  { name, description, statusId }: TCategoryUpdater
) {
  return await atomic("Updating category", async (transaction) => {
    const cat = await Category.findByPk(id, { transaction });
    if (!cat) return null;

    const preChanges = cat.get({ plain: true });
    let saving = false;

    if (name !== undefined && cat.name !== name) {
      cat.name = name;
      saving = true;
    }

    if (description !== undefined && cat.description !== description) {
      cat.description = description;
      saving = true;
    }

    if (statusId !== undefined && cat.statusId !== statusId) {
      cat.statusId = statusId;
      saving = true;
    }

    if (saving) {
      await CategoryArchive.create(preChanges, { transaction });
      const rev = await Revision.create({ revBy }, { transaction });
      cat.revId = rev.id;
      await cat.save({ transaction });
    } else err("no changes in category, rolling back");

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
