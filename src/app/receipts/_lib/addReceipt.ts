"use server";

import { eq } from "drizzle-orm";

import { atomic, TItemShare, TReceipt } from "@/app/_lib/db";
import { items, itemShares, receipts } from "@/app/_lib/db/schema";
import { err, nulledEmptyStrings } from "@/app/_lib/utils";
import { currentUser } from "@/app/(users)/_lib";
import { RECEIPT_COLS_WITH } from "./common";

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
