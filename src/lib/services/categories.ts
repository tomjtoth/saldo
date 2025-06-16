import { col, fn, Op } from "sequelize";

import {
  atomic,
  Category,
  CategoryArchive,
  Item,
  ItemShare,
  Revision,
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
    let changedOriginal = false;

    const cat = await Category.findByPk(id, { transaction });

    if (!cat) return null;

    await CategoryArchive.create(cat.get({ plain: true }), { transaction });

    const rev = await Revision.create({ revBy }, { transaction });
    cat.revId = rev.id;

    if (data.name !== undefined && cat.name !== data.name) {
      cat.name = data.name;
      changedOriginal = true;
    }

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
  {
    idsOnly = false,
    activeOnly = false,
  }: {
    idsOnly?: boolean;
    activeOnly?: boolean;
  } = {}
) {
  return await Category.findAll({
    ...(idsOnly && { attributes: ["id"] }),
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
      { model: Revision, ...(idsOnly && { attributes: [] }) },
      {
        model: CategoryArchive,
        as: "archives",
        include: [
          {
            model: Revision,
            ...(idsOnly && { attributes: [] }),
            ...(!idsOnly && { include: [User] }),
          },
        ],
      },
    ],
    where: {
      [Op.and]: [
        ...(activeOnly ? [{ statusId: { [Op.eq]: 1 } }] : []),
        {
          [Op.or]: [
            // Used by this user (via ItemShare)
            { "$Items.shares.user_id$": userId },
            // Category revision by this user
            { "$Revision.rev_by$": userId },
            // Archive revision by this user
            { "$archives.Revision.rev_by$": userId },
          ],
        },
      ],
    },
    ...(!idsOnly && {
      order: [[fn("LOWER", col("Category.description")), "ASC"]],
    }),
  });
}
