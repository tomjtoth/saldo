"use server";

import { and, eq, exists, sql } from "drizzle-orm";

import {
  atomic,
  db,
  getArchivePopulator,
  isActive,
  TCategory,
  TGroup,
  updater,
} from "@/lib/db";
import { categories, groups, memberships } from "@/lib/db/schema";
import { updateMembership } from "@/lib/services/memberships";
import { withUser } from "@/lib/services/users";
import {
  err,
  has3ConsecutiveLetters,
  nullEmptyStrings,
  nulledEmptyStrings,
  sortByName,
} from "../utils";

export async function svcCreateCategory(
  groupId: number,
  name: string,
  description: string
) {
  const { id } = await withUser();

  if (
    typeof name !== "string" ||
    typeof groupId !== "number" ||
    !["string", "undefined"].includes(typeof description)
  )
    err();

  has3ConsecutiveLetters(name);

  const data = {
    groupId,
    name,
    description,
  };

  nullEmptyStrings(data);

  return await atomic(
    { operation: "Creating category", revisedBy: id },
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

export type TCategoryUpdater = Pick<
  TCategory,
  "name" | "description" | "flags"
>;

export async function svcUpdateCategory(
  id: number,
  { flags, name, description }: TCategoryUpdater
) {
  const { id: userId } = await withUser();

  if (
    typeof id !== "number" ||
    (typeof name !== "string" &&
      typeof description !== "string" &&
      typeof flags !== "number")
  )
    err();

  if (!(await userAccessToCat(userId, id))) err(403);

  const modifier = nulledEmptyStrings({
    name,
    description,
    flags,
  });

  return await atomic(
    { operation: "Updating category", revisedBy: userId },
    async (tx, revisionId) => {
      const cat = (await tx.query.categories.findFirst({
        where: eq(categories.id, id),
      }))!;

      const saving = await updater(cat, modifier, {
        tx,
        tableName: "categories",
        revisionId,
        entityPk1: id,
      });

      if (saving)
        await tx.update(categories).set(cat).where(eq(categories.id, id));
      else err("No changes were made");

      const res = (await tx.query.categories.findFirst({
        with: {
          revision: {
            columns: {
              createdAt: true,
            },
            with: { createdBy: { columns: { name: true } } },
          },
        },
        where: eq(categories.id, cat.id),
      })) as TCategory;

      const populateArchives = await getArchivePopulator<TCategory>(
        "categories",
        "id",
        { tx }
      );

      populateArchives([res]);

      return res;
    }
  );
}

export async function svcSetDefaultCategory(id: number) {
  const { id: userId } = await withUser();

  if (typeof id !== "number") err();

  if (!(await userAccessToCat(userId, id))) err(403);

  const { groupId } = (await db.query.categories.findFirst({
    columns: { groupId: true },
  }))!;

  await updateMembership(userId, {
    userId,
    groupId,
    defaultCategoryId: id,
  });
}

export async function userAccessToCat(userId: number, catId: number) {
  const res = await db.query.categories.findFirst({
    columns: { id: true },
    where: and(
      eq(categories.id, catId),
      exists(
        db
          .select({ x: sql`1` })
          .from(memberships)
          .where(
            and(
              eq(memberships.groupId, categories.groupId),
              eq(memberships.userId, userId),
              isActive(memberships)
            )
          )
      )
    ),
  });

  return !!res;
}

export async function getCategories(userId: number) {
  const res = (await db.query.groups.findMany({
    columns: {
      id: true,
      name: true,
    },

    with: {
      memberships: {
        columns: { defaultCategoryId: true },
        with: { user: { columns: { id: true, name: true } } },
      },
      revision: {
        columns: { createdAt: true },
        with: { createdBy: { columns: { id: true, name: true } } },
      },
      categories: {
        with: {
          revision: {
            columns: { createdAt: true },
            with: { createdBy: { columns: { name: true } } },
          },
        },
      },
    },

    where: and(
      isActive(groups),
      exists(
        db
          .select({ x: sql`1` })
          .from(memberships)
          .where(
            and(
              eq(memberships.groupId, groups.id),
              eq(memberships.userId, userId),
              isActive(memberships)
            )
          )
      )
    ),
  })) as TGroup[];

  const populateArchives = await getArchivePopulator<TCategory>(
    "categories",
    "id"
  );

  res.sort(sortByName);
  res.forEach((g) => {
    g.categories!.sort(sortByName);
    populateArchives(g.categories!);
  });

  return res;
}
