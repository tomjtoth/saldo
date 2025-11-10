"use server";

import { and, eq, exists, sql } from "drizzle-orm";

import {
  atomic,
  db,
  getArchivePopulator,
  isActive,
  TCategory,
  TGroup,
  modEntity,
} from "@/app/_lib/db";
import { categories, groups, memberships } from "@/app/_lib/db/schema";
import { currentUser } from "@/app/(users)/_lib";
import { svcModMembership } from "@/app/(memberships)/_lib";
import {
  err,
  has3ConsecutiveLetters,
  nullEmptyStrings,
  nulledEmptyStrings,
  sortByName,
} from "@/app/_lib/utils";

type RequiredCategoryFields = Required<
  Pick<TCategory, "groupId" | "name" | "description">
>;

export async function apiAddCategory(uncheckedData: RequiredCategoryFields) {
  const user = await currentUser();

  const { groupId, name, description } = uncheckedData;
  const typeDescr = typeof description;

  if (
    typeof name !== "string" ||
    typeof groupId !== "number" ||
    (typeDescr !== "string" && typeDescr !== "undefined")
  )
    err();

  has3ConsecutiveLetters(name);

  const data = { groupId, name, description };

  nullEmptyStrings(data);

  return await svcAddCategory(user.id, data);
}

export async function svcAddCategory(
  revisedBy: number,
  data: RequiredCategoryFields
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

      const res = await tx.query.categories.findFirst({
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

      return res as TCategory;
    }
  );
}

type CategoryModifier = Required<Pick<TCategory, "id">> &
  Pick<TCategory, "name" | "description" | "flags">;

export async function apiModCategory({
  id,
  flags,
  name,
  description,
}: CategoryModifier) {
  if (
    typeof id !== "number" ||
    (typeof name !== "string" &&
      typeof description !== "string" &&
      typeof flags !== "number")
  )
    err();

  const data = nulledEmptyStrings({
    id,
    name,
    description,
    flags,
  });

  const user = await currentUser();

  if (!(await userHasAccessToCategory(user.id, id))) err(403);

  return await svcModCategory(user.id, data);
}

async function svcModCategory(
  revisedBy: number,
  { id, ...modifier }: CategoryModifier
) {
  return await atomic(
    { operation: "Updating category", revisedBy },
    async (tx, revisionId) => {
      const cat = (await tx.query.categories.findFirst({
        where: eq(categories.id, id),
      }))!;

      const res = (await modEntity(cat, modifier, {
        tx,
        tableName: "categories",
        revisionId,
        primaryKeys: { id: true },

        returns: {
          with: {
            revision: {
              columns: {
                createdAt: true,
              },
              with: { createdBy: { columns: { name: true } } },
            },
          },
        },
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

export async function apiSetDefaultCategory(categoryId: number) {
  if (typeof categoryId !== "number") err();

  const { id: userId } = await currentUser();

  if (!(await userHasAccessToCategory(userId, categoryId))) err(403);

  const cat = await db.query.categories.findFirst({
    columns: { groupId: true },
    where: eq(categories.id, categoryId),
  });

  await svcModMembership(userId, {
    userId,
    groupId: cat!.groupId!,
    defaultCategoryId: categoryId,
  });
}

async function userHasAccessToCategory(userId: number, catId: number) {
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

export async function svcGetCategories(userId: number) {
  const res: TGroup[] = await db.query.groups.findMany({
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
  });

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
