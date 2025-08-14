import { eq } from "drizzle-orm";

import {
  atomic,
  db,
  getArchivePopulator,
  TCategory,
  TCrCategory,
  updater,
} from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { err, sortByName } from "../utils";

export async function createCategory(
  revisedBy: number,
  data: Pick<TCrCategory, "name" | "description" | "groupId">
) {
  return await atomic(
    { operation: "Creating category", revisedBy },
    async (tx, revisionId) => {
      const [{ id }] = await tx
        .insert(categories)
        .values({
          ...data,
          revisionId,
        })
        .returning({ id: categories.id });

      return await tx.query.categories.findFirst({
        with: {
          revision: {
            columns: {
              createdAt: true,
            },
            with: {
              createdBy: { columns: { name: true } },
            },
          },
        },
        where: eq(categories.id, id),
      });
    }
  );
}

export type TCategoryUpdater = Partial<
  Pick<Category, "name" | "description" | "statusId">
>;

export async function updateCategory(
  id: number,
  revisedBy: number,
  modifier: TCategoryUpdater
) {
  return await atomic(
    { operation: "Updating category", revisedBy },
    async (tx, rev) => {
      const cat = (await tx.category.findUnique({ where: { id } }))!;

      const saving = await updater(cat, modifier, {
        tx,
        tableName: "Category",
        revisionId: rev.id!,
        entityPk1: id,
      });

      if (saving) await tx.category.update({ data: cat, where: { id } });
      else err("No changes were made");

      const res = await tx.category.findUnique({
        where: { id: cat.id },
        include: {
          revision: {
            select: {
              createdAtInt: true,
              createdBy: { select: { name: true } },
            },
          },
        },
      });

      const populateArchives = await getArchivePopulator<TCategory>(
        "Category",
        "id",
        { tx }
      );

      populateArchives([res as TCategory]);

      return res;
    }
  );
}

export async function userAccessToCat(userId: number, catId: number) {
  const exists = await db.category.findFirst({
    select: { id: true },

    where: {
      id: catId,
      group: {
        is: {
          memberships: {
            some: {
              userId,
              statusId: { in: [0, 2] },
            },
          },
        },
      },
    },
  });

  return !!exists;
}

export async function getCategories(userId: number) {
  const groups = await db.group.findMany({
    select: {
      id: true,
      name: true,
      memberships: {
        select: {
          defaultCategoryId: true,
          user: { select: { id: true, name: true } },
        },
        where: { userId, statusId: { in: [0, 2] } },
      },
      revision: {
        select: {
          createdAtInt: true,
          createdBy: { select: { id: true, name: true } },
        },
      },
      categories: {
        include: {
          revision: {
            select: {
              createdAtInt: true,
              createdBy: { select: { name: true } },
            },
          },
        },
      },
    },
    where: {
      statusId: 0,
      memberships: {
        some: { userId },
      },
    },
  });

  const populateArchives = await getArchivePopulator<TCategory>(
    "Category",
    "id"
  );

  groups.sort(sortByName);
  groups.forEach((g) => {
    g.categories.sort(sortByName);
    populateArchives(g.categories);
  });

  return groups;
}
