"use server";

import { and, eq, exists, sql } from "drizzle-orm";

import {
  atomic,
  db,
  getArchivePopulator,
  isActive,
  modEntity,
  DbCategory,
} from "@/app/_lib/db";
import { categories, groups, memberships } from "@/app/_lib/db/schema";
import { currentUser, User } from "@/app/(users)/_lib";
import { svcModMembership } from "@/app/(memberships)/_lib";
import {
  err,
  has3ConsecutiveLetters,
  nullEmptyStrings,
  sortByName,
} from "@/app/_lib/utils";

const WITH_CATEGORIES = {
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
} as const;

type CategoryAdder = Pick<DbCategory, "groupId" | "name" | "description">;

export async function apiAddCategory({
  groupId,
  name,
  description,
}: CategoryAdder) {
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

  const user = await currentUser();

  return await svcAddCategory(user.id, data);
}

export type Category = Awaited<ReturnType<typeof svcModCategory>>;

export async function svcAddCategory(
  revisedBy: number,
  data: CategoryAdder
): Promise<Category> {
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
        ...WITH_CATEGORIES,
        where: eq(categories.id, id),
      });

      return { ...res!, archives: [] };
    }
  );
}

type CategoryModifier = Pick<DbCategory, "id"> &
  Partial<Pick<DbCategory, "name" | "description" | "flags">>;

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

  const data = {
    id,
    name,
    description,
    flags,
  };

  nullEmptyStrings(data);

  const user = await currentUser();

  if (!(await userHasAccessToCategory(user.id, id))) err(403);

  return await svcModCategory(user.id, data);
}

export async function svcModCategory(
  revisedBy: User["id"],
  { id, ...modifier }: CategoryModifier
): Promise<
  Awaited<ReturnType<typeof svcGetCategories>>[number]["categories"][number]
> {
  return await atomic(
    { operation: "Updating category", revisedBy },
    async (tx, revisionId) => {
      const cat = await tx.query.categories.findFirst({
        where: eq(categories.id, id),
      });

      if (!cat) err(404);

      await modEntity(cat, modifier, {
        tx,
        tableName: "categories",
        revisionId,
        primaryKeys: { id: true },
      });

      // TODO: merge this call into modEntity and
      // get the ReturnType according to the args passed
      const res = await tx.query.categories.findFirst({
        ...WITH_CATEGORIES,
        where: eq(categories.id, cat.id),
      });

      const withArchives = await getArchivePopulator("categories", "id", {
        tx,
      });

      return withArchives([res!])[0];
    }
  );
}

export async function apiSetDefaultCategory(categoryId: DbCategory["id"]) {
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
  const res = await db.query.groups.findMany({
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
      categories: WITH_CATEGORIES,
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

  const withArchives = await getArchivePopulator("categories", "id");

  res.sort(sortByName);

  return res.map((group) => ({
    ...group,
    categories: withArchives(group.categories.toSorted(sortByName)),
  }));
}
