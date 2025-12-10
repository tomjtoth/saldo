"use server";

import { sortByName } from "@/app/_lib/utils";
import {
  db,
  DrizzleTx,
  getArchivePopulator,
  isActive,
  WhereClauseOf,
} from "@/app/_lib/db";
import { SELECT_CATEGORIES } from "./common";
import { User } from "@/app/(users)/_lib";

export type Category = Awaited<ReturnType<typeof svcGetCategories>>[number];

export async function svcGetCategories(
  userId: User["id"],
  opts: { tx?: DrizzleTx; where?: WhereClauseOf<"categories"> } = {}
) {
  const tx = opts.tx ?? db;
  const arr = await tx.query.categories.findMany({
    ...SELECT_CATEGORIES,

    where: opts.where ?? {
      group: {
        memberships: {
          userId,
          RAW: isActive,
        },
      },
    },
  });

  const withArchives = await getArchivePopulator(opts.tx);

  return withArchives("categories", arr.toSorted(sortByName));
}
