import { Op } from "sequelize";

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

    const preChanges = cat.get({ plain: true, clone: true });
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
    } else err("No changes were made");

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

export async function getCatsIdsFor(userId: number) {
  return await Category.findAll({
    attributes: ["id"],
    include: [
      {
        model: Group,
        attributes: [],
        include: [{ model: Membership, attributes: [], where: { userId } }],
      },
    ],
  });
}

export async function getCatsDataFor(userId: number) {
  return await Group.findAll({
    attributes: ["id", "name"],
    include: [
      {
        model: Membership,
        attributes: [],
        where: { [Op.and]: [{ userId }, { statusId: 1 }] },
      },
      { model: Revision, attributes: ["revOn"] },
      { model: User, attributes: ["id", "name"] },
      {
        model: Category,
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
      },
    ],
    where: { statusId: 1 },
  });
}
