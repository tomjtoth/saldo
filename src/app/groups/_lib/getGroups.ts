"use server";

import { eq, exists, and, sql, SQL } from "drizzle-orm";

import {
  ConsumptionData,
  db,
  DrizzleTx,
  getArchivePopulator,
  isActive,
} from "@/app/_lib/db";
import { groups, memberships } from "@/app/_lib/db/schema";
import { sortByName } from "@/app/_lib/utils";
import { User } from "@/app/(users)/_lib";
import { SELECT_CATEGORIES, SELECT_REVISION_INFO } from "@/app/_lib";
import {
  populateReceiptArchivesRecursively,
  queryReceipts,
  Receipt,
  ReceiptsFromDb,
} from "@/app/receipts/_lib";
import { colorsForGroups } from "./getColors";
import { consumptionQuery } from "@/app/(charts)/consumption/_lib";
import { balanceQuery, getBalanceParser } from "@/app/(charts)/balance/_lib";

export type Group = Awaited<ReturnType<typeof svcGetGroups>>[number];

export type Membership = Group["memberships"][number];

export async function svcGetGroups(
  userId: User["id"],
  {
    tx,
    where,
    extras = {},
  }: {
    tx?: DrizzleTx;
    where?: SQL;
    extras?: {
      receipts?: true;
      consumption?: { from: string };
      balance?: true;
    };
  } = {}
) {
  const arr = await (tx ?? db).query.groups.findMany({
    columns: { revisionId: false },

    extras: {
      ...("consumption" in extras
        ? {
            consumption: consumptionQuery(extras.consumption).as("consumption"),
          }
        : {}),
      ...("balance" in extras ? { balance: balanceQuery() } : {}),
    },

    with: {
      categories: SELECT_CATEGORIES,

      ...("receipts" in extras ? { receipts: queryReceipts() } : {}),

      memberships: {
        with: {
          user: {
            columns: {
              defaultGroupId: false,
              revisionId: false,
            },

            extras: {
              color: colorsForGroups(userId),
            },
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

  const parser = getBalanceParser();

  return Promise.all(
    arr.toSorted(sortByName).map(async (group) => {
      group.memberships.sort((a, b) => sortByName(a.user, b.user));

      const receipts: Receipt[] =
        "receipts" in group
          ? await populateReceiptArchivesRecursively(
              group.receipts as ReceiptsFromDb,
              archivePopulator
            )
          : [];

      const consumption: ConsumptionData[] =
        "consumption" in group ? JSON.parse(group.consumption as string) : [];

      return {
        ...group,
        users: group?.memberships.map((ms) => ms.user),

        categories: archivePopulator(
          "categories",
          group.categories.toSorted(sortByName)
        ),

        receipts,
        consumption,
        balance: parser(group),
      };
    })
  );
}

// TODO: remove all of the below, once the typing has been fixed
// (?<=\w)[?!](?=\.)
