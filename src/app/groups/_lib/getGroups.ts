"use server";

import { eq, exists, and, sql, SQL } from "drizzle-orm";

import {
  BalanceData,
  ConsumptionData,
  db,
  DrizzleTx,
  getArchivePopulator,
  isActive,
} from "@/app/_lib/db";
import { groups, memberships } from "@/app/_lib/db/schema";
import { sortByName } from "@/app/_lib/utils";
import { svcGetColors } from "./getColors";
import { User } from "@/app/(users)/_lib";
import { SELECT_CATEGORIES, SELECT_REVISION_INFO } from "@/app/_lib";
import {
  populateReceiptArchivesRecursively,
  queryReceipts,
  Receipt,
  ReceiptsFromDb,
} from "@/app/receipts/_lib/common";

export type Group = Awaited<ReturnType<typeof svcGetGroups>>[number];

export type Membership = Group["memberships"][number];

export async function svcGetGroups(
  userId: User["id"],
  {
    tx,
    where,
    view,
  }: {
    tx?: DrizzleTx;
    where?: SQL;
    view?: "receipts"; //| "balance" | "consumption";
  } = {}
) {
  const colors = await svcGetColors(userId);

  const arr = await (tx ?? db).query.groups.findMany({
    columns: { revisionId: false },

    with: {
      categories: SELECT_CATEGORIES,

      ...(view === "receipts" ? { receipts: queryReceipts() } : {}),

      // TODO: integrate my custom queries **somehow** into this query,
      // so that I only need one DB query...

      // ...(view === "consumption" ? { consumption: consumptionQuery() } : {}),
      // ...(view === "balance" ? { balance: balanceQuery() } : {}),

      memberships: {
        with: {
          user: {
            columns: {
              defaultGroupId: false,
              revisionId: false,
            },

            // TODO:
            // extras: {
            //   color: sql<string>`'#012345'`.as("color"),
            // },
          },
          revision: SELECT_REVISION_INFO,
        },
      },
    },

    where:
      where ??
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
      ),
  });

  const archivePopulator = await getArchivePopulator(tx);

  return Promise.all(
    arr.toSorted(sortByName).map(async (group) => {
      group.memberships.sort((a, b) => sortByName(a.user, b.user));

      const users = group.memberships.map((ms) => ({
        ...ms.user,
        color: colors.find(
          (row) => row.groupId === group.id && row.userId === ms.user.id
        )!.color,
      }));

      return {
        ...group,
        users,
        categories: archivePopulator(
          "categories",
          group.categories.toSorted(sortByName)
        ),
        receipts:
          "receipts" in group
            ? await populateReceiptArchivesRecursively(
                group.receipts as ReceiptsFromDb,
                archivePopulator
              )
            : ([] as Receipt[]),
        consumption: [] as ConsumptionData[],
        balance: { relations: [], data: [] } as BalanceData,
      };
    })
  );
}

// TODO: remove all of the below, once the typing has been fixed
// (?<=\w)[?!](?=\.)
