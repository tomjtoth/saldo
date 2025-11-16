import { eq, sql, desc } from "drizzle-orm";

import { receipts } from "@/app/_lib/db/schema";
import { QueryParamsOf, DbReceipt, DrizzleTx } from "@/app/_lib/db/types";
import { getArchivePopulator } from "@/app/_lib/db/archives";
import { db } from "@/app/_lib/db";
import { SELECT_RECEIPTS } from "@/app/_lib";

export const queryReceipts = (knownIds: Receipt["id"][] = []) =>
  ({
    ...SELECT_RECEIPTS,
    limit: 50,
    where: sql`${receipts.id} not in ${sql.raw(
      "(" + knownIds.join(", ") + ")"
    )}`,
    orderBy: desc(receipts.paidOn),
  } as const satisfies QueryParamsOf<"receipts">);

const getMany = (receiptId: DbReceipt["id"], tx?: DrizzleTx) =>
  (tx ?? db).query.receipts.findMany({
    ...SELECT_RECEIPTS,
    where: eq(receipts.id, receiptId),
  });

type ManyFromDb = Awaited<ReturnType<typeof getMany>>;

export type Receipt = Awaited<ReturnType<typeof populateRecursively>>[number];
export type Item = Receipt["items"][number];
export type ItemShare = Item["itemShares"][number];

export async function populateReceiptArchivesRecursively(
  ...args: Parameters<typeof getMany>
): Promise<Receipt>;

export async function populateReceiptArchivesRecursively(
  receipts: ManyFromDb,
  tx?: DrizzleTx
): Promise<Receipt[]>;

export async function populateReceiptArchivesRecursively(
  idOrArr: DbReceipt["id"] | ManyFromDb,
  tx?: DrizzleTx
) {
  const single = typeof idOrArr === "number";

  const receipts = single ? await getMany(idOrArr, tx) : idOrArr;
  const populated = await populateRecursively(receipts, tx);

  return single ? populated[0] : populated;
}

async function populateRecursively(arr: ManyFromDb, tx?: DrizzleTx) {
  const receiptWithArchives = await getArchivePopulator("receipts", "id", {
    tx,
  });

  const itemsWithArchives = await getArchivePopulator("items", "id", {
    tx,
  });

  const itemSharesWithArchives = await getArchivePopulator(
    "itemShares",
    "itemId",
    {
      pk2: "userId",
      tx,
    }
  );

  return receiptWithArchives(
    arr.map((receipt) => ({
      ...receipt,
      items: itemsWithArchives(
        receipt.items.map(({ itemShares, ...item }) => ({
          ...item,
          itemShares: itemSharesWithArchives(itemShares),
        }))
      ),
    }))
  );
}
