import {
  atomic,
  Category,
  CategoryArchive,
  Revision,
  TCrCategory,
} from "../models";

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

    await CategoryArchive.create(
      cat!.get({
        plain: true,
      }),
      { transaction }
    );

    const rev = await Revision.create({ revBy }, { transaction });
    cat!.revId = rev.id;

    if (data.description !== undefined) {
      cat!.description = data.description;
      changedOriginal = true;
    }

    if (data.statusId !== undefined) {
      cat!.statusId = data.statusId;
      changedOriginal = true;
    }

    if (changedOriginal) await cat!.save({ transaction });
    else throw new Error("nothing changed");

    return cat;
  });
}
