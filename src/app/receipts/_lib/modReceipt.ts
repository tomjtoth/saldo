"use server";

import { eq } from "drizzle-orm";

import {
  atomic,
  DbItem,
  DbItemShare,
  DbReceipt,
  modEntity,
} from "@/app/_lib/db";
import { items, itemShares, receipts } from "@/app/_lib/db/schema";
import { apiInternal, err, nullEmptyStrings, virt } from "@/app/_lib/utils";
import { currentUser, User } from "@/app/(users)/_lib";
import {
  populateReceiptArchivesRecursively,
  Receipt,
} from "./populateRecursively";
import { svcGetGroupViaUserAccess } from "@/app/groups/_lib";

type ReceiptModifier = DbReceipt & {
  items: (DbItem & { itemShares: DbItemShare[] })[];
};

function validateReceipt({
  id,
  groupId,
  paidOn,
  paidById,
  flags,
  items,
}: ReceiptModifier) {
  if (
    typeof id !== "number" ||
    typeof groupId !== "number" ||
    typeof paidById !== "number" ||
    typeof paidOn !== "string" ||
    typeof flags !== "number" ||
    !Array.isArray(items)
  )
    err(400);

  const safeReceipt = {
    id,
    groupId,
    paidById,
    paidOn,
    flags,
    items: items.map(({ id, categoryId, flags, cost, notes, itemShares }) => {
      if (
        typeof id !== "number" ||
        typeof categoryId !== "number" ||
        typeof cost !== "number" ||
        typeof flags !== "number" ||
        (notes !== null && typeof notes !== "string") ||
        !Array.isArray(itemShares)
      )
        err(400);

      const safeItem = {
        id,
        categoryId,
        flags,
        cost,
        notes,
        itemShares: itemShares.map(({ userId, share }) => {
          if (typeof userId !== "number" || typeof share !== "number") err(400);

          const safeItemShare = { userId, share };

          return safeItemShare;
        }),
      };

      return nullEmptyStrings(safeItem);
    }),
  };

  return safeReceipt;
}

export async function apiModReceipt(uncheckedData: ReceiptModifier) {
  return apiInternal(async () => {
    const safeReceipt = validateReceipt(uncheckedData);

    const user = await currentUser();

    await svcGetGroupViaUserAccess(user.id, safeReceipt.groupId, {
      info: "modifying receipt",
    });

    return await svcModReceipt(user.id, safeReceipt);
  });
}

export async function svcModReceipt(
  revisedBy: User["id"],
  { items: itemMods, ...receiptMod }: ReturnType<typeof validateReceipt>
): Promise<Receipt> {
  return atomic(
    { revisedBy, operation: "updating receipt" },

    async (tx, revisionId) => {
      const fromSrv = await tx.query.receipts.findFirst({
        with: {
          items: { with: { itemShares: true } },
          group: { columns: { flags: true } },
        },
        where: eq(receipts.id, receiptMod.id),
      });

      if (!fromSrv) err("receipt not found", { args: { receiptMod } });

      if (!virt(fromSrv.group).active)
        err("Modifying a receipt of a disabled group is not allowed!");

      const {
        // eslint-disable-next-line @typescript-unused-var
        group: _discardGroupsHere,
        items: srvItems,
        ...receipt
      } = fromSrv;

      let changes = await modEntity(receipt, receiptMod, {
        tx,
        tableName: "receipts",
        revisionId,
        primaryKeys: { id: true },
        unchangedThrows: false,
      });

      // checking what changed in old data first
      for (const avoidCrashingDebugger of srvItems) {
        // https://chatgpt.com/share/69121a51-3304-800b-86db-e448eff3ac9e
        const { itemShares: srvItemShares, ...item } = avoidCrashingDebugger;

        let cliItem = itemMods.find((i) => i.id === item.id);

        // item has been deleted on the client side
        if (!cliItem) {
          cliItem = { ...item, itemShares: [] };
          virt(cliItem).active = false;
        }

        const { itemShares: cliItemShares, ...itemModifier } = cliItem;

        changes += await modEntity(item, itemModifier, {
          tx,
          tableName: "items",
          revisionId,
          primaryKeys: { id: true },
          unchangedThrows: false,
        });

        for (const oldItemShare of srvItemShares) {
          let modItemShare = cliItemShares.find(
            (mod) =>
              mod.userId === oldItemShare.userId &&
              itemModifier.id === oldItemShare.itemId
          );

          // itemShare has been deleted on the client side: shouldn't occur,
          // since pre-existing shares simply get 0 value when "deleted"
          if (!modItemShare) {
            modItemShare = { ...oldItemShare };
            virt(cliItem).active = false;
          }

          changes += await modEntity(oldItemShare, modItemShare, {
            tx,
            tableName: "itemShares",
            revisionId,
            primaryKeys: { itemId: true, userId: true },
          });
        }

        const newItemShares = cliItemShares.filter(
          (mod) =>
            !srvItemShares.some(
              // `modItem.id` because client side shares only store `userId` and `share`
              (old) =>
                old.itemId === itemModifier.id && old.userId === mod.userId
            )
        );

        if (newItemShares.length) {
          changes += newItemShares.length;

          await tx.insert(itemShares).values(
            newItemShares.map((nsh) => ({
              ...nsh,
              itemId: itemModifier.id,
              revisionId,
            }))
          );
        }
      }

      // checking if any item was added
      const newItems = itemMods.filter(
        (mi) => !srvItems.some((oi) => oi.id === mi.id)
      );

      for (const avoidCrashingDebugger of newItems) {
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          id: _discardingClientSidePlaceholderId,
          itemShares: newItemShares,
          ...newItem
        } = avoidCrashingDebugger;

        const [{ itemId }] = await tx
          .insert(items)
          .values([{ ...newItem, revisionId, receiptId: receipt.id }])
          .returning({ itemId: items.id });

        changes += 1;

        if (newItemShares.length) {
          changes += newItemShares.length;

          await tx.insert(itemShares).values(
            newItemShares.map((nsh) => ({
              ...nsh,
              itemId,
              revisionId,
            }))
          );
        }
      }

      if (changes === 0)
        err("No changes were made", { info: "updating receipt" });

      return await populateReceiptArchivesRecursively(receipt.id, tx);
    }
  );
}
