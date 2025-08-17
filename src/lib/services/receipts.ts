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
import { nulledEmptyStrings, sortByName } from "../utils";

export type TReceiptInput = TCliReceipt & { groupId: number };

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

export async function addReceipt(addedBy: number, data: TReceiptInput) {
  return await atomic(
    { operation: "Adding receipt", revisedBy: addedBy },
    async (tx, revisionId) => {
      const [{ receiptId }] = await tx
        .insert(receipts)
        .values({
          groupId: data.groupId,
          revisionId,
          paidOn: data.paidOn,
          paidById: data.paidBy,
        })
        .returning({ receiptId: receipts.id });

      const itemIds = await tx
        .insert(items)
        .values(
          data.items.map(({ cost, categoryId, notes }) =>
            nulledEmptyStrings({
              receiptId,
              revisionId,
              categoryId,
              cost: parseFloat(cost),
              notes,
            })
          )
        )
        .returning({ id: items.id });

      await tx.insert(itemShares).values(
        data.items.flatMap((i, idx) =>
          Object.entries(i.shares)
            .filter(([, share]) => share !== 0)
            .map(([uidStr, share]) => ({
              itemId: itemIds[idx].id,
              userId: Number(uidStr),
              revisionId,
              share,
            }))
        )
      );

      const receipt = (await tx.query.receipts.findFirst({
        ...RECEIPT_COLS_WITH,
        where: eq(receipts.id, receiptId),
      })) as TReceipt;

      receipt.archives = [];

      return receipt;
    }
  );
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
