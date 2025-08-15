import {
  atomic,
  db,
  getArchivePopulator,
  isActive,
  orderByLowerName,
  TGroup,
  TReceipt,
} from "@/lib/db";
import { TCliReceipt } from "../reducers";
import { sortByName } from "../utils";
import { items, itemShares, memberships, receipts } from "../db/schema";

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

      db.query.receipts.findFirst({
        columns: { id: true, groupId: true },
      });

      const itemIds = await tx
        .insert(items)
        .values(
          data.items.map(({ cost, categoryId, notes }) => ({
            receiptId,
            revisionId,
            categoryId,
            cost: parseFloat(cost),
            notes,
          }))
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
        where: (t, o) => o.eq(t.id, receiptId),
      })) as TReceipt;

      receipt.archives = [];

      return receipt;
    }
  );
}

export async function getReceipts(userId: number, knownIds: number[] = []) {
  const groups = (await db.query.groups.findMany({
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
        where: (t, op) =>
          op.sql`${t.id} not in ${op.sql.raw("(" + knownIds.join(", ") + ")")}`,
        orderBy: (t, op) => op.desc(t.paidOn),
      },
    },
    where: (t, { exists, eq, and, sql }) =>
      exists(
        db
          .select({ x: sql`1` })
          .from(memberships)
          .where(
            and(eq(memberships.groupId, t.id), eq(memberships.userId, userId))
          )
      ),
    orderBy: (t, op) => op.sql`lower(${t.name})`,
  })) as TGroup[];

  const populateArchives = await getArchivePopulator<TReceipt>(
    "receipts",
    "id"
  );

  groups.sort(sortByName);
  groups.forEach((g) => {
    g.categories!.sort(sortByName);
    populateArchives(g.receipts!);
  });

  return groups;
}
