import {
  atomic,
  Category,
  CategoryArchive,
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
      { transaction }
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
      include: [{ model: CategoryArchive, as: "archives" }],
    })!;
  });
}
