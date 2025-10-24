"use server";

import { and, desc, eq, exists, sql } from "drizzle-orm";

import {
  atomic,
  db,
  getArchivePopulator,
  isActive,
  orderByLowerName,
  TGroup,
  TReceipt,
} from "@/lib/db";
import { groups, items, itemShares, memberships, receipts } from "../db/schema";
import { TCliReceipt } from "../reducers";
import { err, nulledEmptyStrings, sortByName } from "../utils";
import { currentUser } from "./users";

const RECEIPT_COLS_WITH = {
  columns: {
    id: true,
    paidOn: true,
  },
  with: {
    revision: {
      columns: {
        createdAt: true,
      },
      with: {
        createdBy: { columns: { name: true } },
      },
    },
    items: { columns: { id: true, cost: true, notes: true, categoryId: true } },
    paidBy: { columns: { name: true } },
  },
};

export type TReceiptInput = TCliReceipt & { groupId: number };

export async function svcAddReceipt({
  groupId,
  paidOn,
  paidBy,
  items,
}: TReceiptInput) {
  const { id: addedBy } = await currentUser();

  if (
    typeof groupId !== "number" ||
    typeof paidOn !== "string" ||
    typeof paidBy !== "number" ||
    !Array.isArray(items) ||
    items.length === 0
  )
    err();

  return await createReceipt(addedBy, {
    groupId,
    paidOn,
    paidBy,
    items,
  });
}

export async function createReceipt(
  revisedBy: number,
  { groupId, paidOn, paidBy, items: itemsCli }: TReceiptInput
) {
  return await atomic(
    { operation: "Adding receipt", revisedBy },
    async (tx, revisionId) => {
      const [{ receiptId }] = await tx
        .insert(receipts)
        .values({ groupId, revisionId, paidOn, paidById: paidBy })
        .returning({ receiptId: receipts.id });

      const itemIds = await tx
        .insert(items)
        .values(
          itemsCli.map(({ cost: strCost, categoryId, notes }) => {
            if (typeof categoryId !== "number")
              err(`categoryId "${categoryId}" is NaN`);

            const cost = parseFloat(strCost);
            if (isNaN(cost)) err(`cost "${strCost}" is NaN`);

            if (notes !== null && typeof notes !== "string")
              err(`note "${notes}" is not a string`);

            return nulledEmptyStrings({
              receiptId,
              revisionId,
              categoryId,
              cost,
              notes,
            });
          })
        )
        .returning({ id: items.id });

      const parsedItemShares = itemsCli.flatMap((i, idx) =>
        Object.entries(i.shares)
          .filter(([, share]) => share !== 0)
          .map(([uidStr, share]) => {
            if (typeof share !== "number") err(`share ${share} is NaN`);

            const userId = Number(uidStr);
            if (isNaN(userId)) err(`userId ${uidStr} is NaN`);

            return {
              itemId: itemIds[idx].id,
              userId,
              revisionId,
              share,
            };
          })
      );

      if (parsedItemShares.length) {
        await tx.insert(itemShares).values(parsedItemShares);
      }

      const receipt = (await tx.query.receipts.findFirst({
        ...RECEIPT_COLS_WITH,
        where: eq(receipts.id, receiptId),
      })) as TReceipt;

      receipt.archives = [];

      return receipt;
    }
  );
}

export async function svcGetReceipts(knownIds: number[]) {
  const user = await currentUser();

  if (!Array.isArray(knownIds) || knownIds.some(isNaN))
    err("known ids contain NaN");

  return await getReceipts(user.id, knownIds);
}

export async function getReceipts(userId: number, knownIds: number[] = []) {
  const res = (await db.query.groups.findMany({
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
  })) as TGroup[];

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
