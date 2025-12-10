"use server";

import { DbReceipt, DrizzleTx } from "@/app/_lib/db/types";
import {
  ArchivePopulatorFn,
  getArchivePopulator,
} from "@/app/_lib/db/archives";
import { db } from "@/app/_lib/db";
import { SELECT_RECEIPTS } from "./common";

const getMany = (receiptId: DbReceipt["id"], tx?: DrizzleTx) =>
  (tx ?? db).query.receipts.findMany({
    ...SELECT_RECEIPTS,
    where: { id: receiptId },
  });

export type ReceiptsFromDb = Awaited<ReturnType<typeof getMany>>;

export type Receipt = Awaited<ReturnType<typeof populateRecursively>>[number];
export type Item = Receipt["items"][number];
export type ItemShare = Item["itemShares"][number];

export async function populateReceiptArchivesRecursively(
  receipts: ReceiptsFromDb,
  populator: ArchivePopulatorFn
): Promise<Receipt[]>;

export async function populateReceiptArchivesRecursively(
  receipts: ReceiptsFromDb,
  tx?: DrizzleTx
): Promise<Receipt[]>;

export async function populateReceiptArchivesRecursively(
  ...args: Parameters<typeof getMany>
): Promise<Receipt>;

export async function populateReceiptArchivesRecursively(
  idOrArr: DbReceipt["id"] | ReceiptsFromDb,
  txOrPopulator?: DrizzleTx | ArchivePopulatorFn
) {
  const single = typeof idOrArr === "number";

  const receipts = single
    ? await getMany(
        idOrArr,
        typeof txOrPopulator === "function" ? undefined : txOrPopulator
      )
    : idOrArr;

  const populated = await populateRecursively(receipts, txOrPopulator);

  return single ? populated[0] : populated;
}

async function populateRecursively(
  arr: ReceiptsFromDb,
  txOrPopulator?: DrizzleTx | ArchivePopulatorFn
) {
  const populator =
    typeof txOrPopulator === "function"
      ? txOrPopulator
      : await getArchivePopulator(txOrPopulator);

  return populator(
    "receipts",
    arr.map((receipt) => ({
      ...receipt,
      items: populator(
        "items",
        receipt.items.map(({ itemShares, ...item }) => ({
          ...item,
          itemShares: populator(
            {
              table: "itemShares",
              primaryKeys: {
                userId: true,
                itemId: true,
              },
            },
            itemShares
          ),
        }))
      ),
    }))
  );
}
