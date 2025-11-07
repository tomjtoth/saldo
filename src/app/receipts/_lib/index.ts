"use server";

import { and, desc, eq, exists, sql } from "drizzle-orm";

import {
  atomic,
  db,
  getArchivePopulator,
  isActive,
  orderByLowerName,
  TGroup,
  TItemShare,
  TReceipt,
} from "@/app/_lib/db";
import {
  groups,
  items,
  itemShares,
  memberships,
  receipts,
} from "@/app/_lib/db/schema";
import { err, nulledEmptyStrings, sortByName } from "@/app/_lib/utils";
import { currentUser } from "@/app/(users)/_lib";

const RECEIPT_COLS_WITH = {
  columns: {
    id: true,
    paidOn: true,
    paidById: true,
  },
  with: {
    revision: {
      columns: {
        createdAt: true,
      },
      with: {
        createdBy: { columns: { id: true, image: true, name: true } },
      },
    },
    items: {
      columns: {
        id: true,
        cost: true,
        notes: true,
        categoryId: true,
        flags: true,
      },
      with: {
        itemShares: true as const,
      },
    },
    paidBy: { columns: { id: true, image: true, name: true } },
  },
};

export type TAddReceipt = Required<
  Pick<TReceipt, "groupId" | "paidOn" | "paidById" | "items">
>;

export async function apiAddReceipt({
  groupId,
  paidOn,
  paidById,
  items,
}: TAddReceipt) {
  if (
    typeof groupId !== "number" ||
    typeof paidOn !== "string" ||
    typeof paidById !== "number" ||
    !Array.isArray(items) ||
    items.length === 0
  )
    err(400);

  const { id } = await currentUser();

  return await svcAddReceipt(id, {
    groupId,
    paidOn,
    paidById,
    items,
  });
}

export async function svcAddReceipt(
  revisedBy: number,
  { groupId, paidOn, paidById, items: itemsCli }: TAddReceipt
) {
  return await atomic(
    { operation: "Adding receipt", revisedBy },
    async (tx, revisionId) => {
      const [{ receiptId }] = await tx
        .insert(receipts)
        .values({ groupId, revisionId, paidOn, paidById })
        .returning({ receiptId: receipts.id });

      const itemIds = await tx
        .insert(items)
        .values(
          itemsCli.map(({ cost, categoryId, notes }) => {
            if (typeof categoryId !== "number")
              err(`categoryId "${categoryId}" is NaN`);

            if (typeof cost !== "number") err(`cost "${cost}" is NaN`);

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

      const parsedItemShares = itemsCli.reduce(
        (shares, { itemShares }, idx) => {
          const filteredItemShares = itemShares!.filter(
            ({ share }) => (share ?? 0) > 0
          );
          if (
            filteredItemShares.length !== 1 ||
            filteredItemShares[0].userId !== paidById
          ) {
            shares.push(
              ...filteredItemShares.map((sh) => ({
                userId: sh.userId!,
                share: sh.share!,
                revisionId,
                itemId: itemIds[idx].id,
              }))
            );
          }

          return shares;
        },
        [] as Required<
          Pick<TItemShare, "revisionId" | "itemId" | "userId" | "share">
        >[]
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

export async function apiGetReceiptsData(knownIds?: number[]) {
  if (!Array.isArray(knownIds) || knownIds.some(isNaN))
    err("known ids contain NaN");

  const { id } = await currentUser();
  return await svcGetReceiptsData(id, knownIds);
}

export async function svcGetReceiptsData(
  userId: number,
  knownIds: number[] = []
) {
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
