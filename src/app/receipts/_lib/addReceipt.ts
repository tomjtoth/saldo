"use server";

import { atomic } from "@/app/_lib/db";
import { items, itemShares, receipts } from "@/app/_lib/db/schema";
import { apiInternal, be, err, nullEmptyStrings } from "@/app/_lib/utils";
import { currentUser, User } from "@/app/(users)/_lib";
import {
  Item,
  ItemShare,
  populateReceiptArchivesRecursively,
  Receipt,
} from "./populateRecursively";
import { svcCheckUserAccessToGroup } from "@/app/groups/_lib";

type ReceiptAdder = Pick<Receipt, "groupId" | "paidOn" | "paidById"> & {
  items: (Pick<Item, "cost" | "categoryId" | "notes"> & {
    itemShares: Pick<ItemShare, "share" | "userId">[];
  })[];
};

type ValidatorFn = typeof validateReceiptData;

function validateReceiptData({
  groupId,
  paidOn,
  paidById,
  items,
}: ReceiptAdder) {
  be.number(groupId, "group ID");
  be.string(paidOn, "paid on");
  be.number(paidById, "paid by ID");
  be.array(items, "items");

  if (items.length === 0) err("must have at least 1 item in a receipt");

  const safeReceipt = {
    groupId,
    paidOn,
    paidById,
    items: items.map(({ cost, categoryId, notes, itemShares }) => {
      be.number(categoryId, "category ID");
      be.number(cost, "cost");
      be.stringOrNull(notes, "notes");
      be.array(itemShares, "item shares");

      const safeItem = {
        categoryId,
        cost,
        notes,
        itemShares: itemShares.map(({ userId, share }) => {
          be.number(userId, "user ID");
          be.number(share, "item share");

          const safeItemShare = { userId, share };

          return safeItemShare;
        }),
      };

      return nullEmptyStrings(safeItem);
    }),
  };

  return safeReceipt;
}

export async function apiAddReceipt(uncheckedData: Parameters<ValidatorFn>[0]) {
  return apiInternal(async () => {
    const safeData = validateReceiptData(uncheckedData);

    const user = await currentUser();

    await svcCheckUserAccessToGroup(user.id, safeData.groupId);

    return await svcAddReceipt(user.id, safeData);
  });
}

export async function svcAddReceipt(
  revisedBy: User["id"],
  { groupId, paidOn, paidById, items: itemsCli }: ReturnType<ValidatorFn>
): Promise<Receipt> {
  return await atomic(
    { operation: "Adding receipt", revisedBy },
    async (tx, revisionId) => {
      const [{ receiptId }] = await tx
        .insert(receipts)
        .values({ groupId, revisionId, paidOn, paidById })
        .returning({ receiptId: receipts.id });

      const itemIds = await tx
        .insert(items)
        .values(itemsCli.map((i) => ({ ...i, receiptId, revisionId })))
        .returning({ id: items.id });

      const parsedItemShares = itemsCli.reduce(
        (shares, { itemShares }, idx) => {
          const filteredItemShares = itemShares.filter(
            ({ share }) => (share ?? 0) > 0
          );
          if (
            filteredItemShares.length !== 1 ||
            filteredItemShares[0].userId !== paidById
          ) {
            shares.push(
              ...filteredItemShares.map(({ userId, share }) => ({
                userId,
                share,
                revisionId,
                itemId: itemIds[idx].id,
              }))
            );
          }

          return shares;
        },
        [] as Pick<ItemShare, "revisionId" | "itemId" | "userId" | "share">[]
      );

      if (parsedItemShares.length) {
        await tx.insert(itemShares).values(parsedItemShares);
      }

      return await populateReceiptArchivesRecursively(receiptId, tx);
    }
  );
}
