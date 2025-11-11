"use server";

import { and, desc, eq, exists, sql } from "drizzle-orm";

import {
  db,
  getArchivePopulator,
  isActive,
  orderByLowerName,
  TGroup,
  TReceipt,
} from "@/app/_lib/db";
import { groups, memberships, receipts } from "@/app/_lib/db/schema";
import { err, sortByName } from "@/app/_lib/utils";
import { currentUser } from "@/app/(users)/_lib";
import { RECEIPT_COLS_WITH } from "./common";

export async function apiGetReceipts(knownIds?: number[]) {
  if (!Array.isArray(knownIds) || knownIds.some(isNaN))
    err("known ids contain NaN");

  const { id } = await currentUser();
  return await svcGetReceipts(id, knownIds);
}

export async function svcGetReceipts(userId: number, knownIds: number[] = []) {
  const res: TGroup[] = await db.query.groups.findMany({
    columns: {
      id: true,
      name: true,
    },
    with: {
      memberships: {
        columns: {
          defaultCategoryId: true,
        },
        with: {
          user: { columns: { id: true, name: true, image: true, email: true } },
        },
        where: isActive,
      },
      categories: {
        columns: { id: true, name: true },
        where: isActive,
        orderBy: orderByLowerName,
      },
      receipts: {
        ...RECEIPT_COLS_WITH,
        limit: 50,
        where: sql`${receipts.id} not in ${sql.raw(
          "(" + knownIds.join(", ") + ")"
        )}`,
        orderBy: desc(receipts.paidOn),
      },
    },
    where: exists(
      db
        .select({ x: sql`1` })
        .from(memberships)
        .where(
          and(
            eq(memberships.groupId, groups.id),
            eq(memberships.userId, userId)
          )
        )
    ),
    orderBy: orderByLowerName,
  });

  const populateArchives = await getArchivePopulator<TReceipt>(
    "receipts",
    "id"
  );

  res.sort(sortByName);
  res.forEach((g) => {
    g.categories!.sort(sortByName);
    populateArchives(g.receipts!);
  });

  return res;
}
