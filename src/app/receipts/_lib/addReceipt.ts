"use server";

import {
  atomic,
  DbItem,
  DbItemShare,
  DbReceipt,
  TItemShare,
} from "@/app/_lib/db";
import { items, itemShares, receipts } from "@/app/_lib/db/schema";
import { err, nullEmptyStrings } from "@/app/_lib/utils";
import { currentUser, User } from "@/app/(users)/_lib";
import { populateReceiptArchivesRecursively, Receipt } from "./common";

export type TAddReceipt = Pick<DbReceipt, "groupId" | "paidOn" | "paidById"> & {
  items: (Pick<DbItem, "cost" | "categoryId" | "notes"> & {
    itemShares: Pick<DbItemShare, "share" | "userId">[];
  })[];
};

type ValidatorFn = typeof validateReceiptData;

function validateReceiptData({
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

  const safeReceipt = {
    groupId,
    paidOn,
    paidById,
    items: items.map(({ cost, categoryId, notes, itemShares }) => {
      if (typeof categoryId !== "number")
        err(`categoryId "${categoryId}" is NaN`);

      if (typeof cost !== "number") err(`cost "${cost}" is NaN`);

      if (notes !== null && typeof notes !== "string")
        err(`note "${notes}" is not a string`);

      if (!Array.isArray(itemShares)) err("itemShares must be an array");

      const safeItem = {
        categoryId,
        cost,
        notes,
        itemShares: itemShares.map(({ userId, share }) => {
          if (typeof userId !== "number" || typeof share !== "number") err(400);

          const safeItemShare = { userId, share };

          return safeItemShare;
        }),
      };

      nullEmptyStrings(safeItem);

      return safeItem;
    }),
  };

  return safeReceipt;
}

export async function apiAddReceipt(uncheckedData: Parameters<ValidatorFn>[0]) {
  const safeData = validateReceiptData(uncheckedData);

  const user = await currentUser();

  return await svcAddReceipt(user.id, safeData);
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

      return await populateReceiptArchivesRecursively(receiptId, tx);
    }
  );
}
