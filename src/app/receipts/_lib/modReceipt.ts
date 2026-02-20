"use server";

import {
  atomic,
  DbItem,
  DbItemShare,
  DbReceipt,
  modEntity,
} from "@/app/_lib/db";
import { items, itemShares } from "@/app/_lib/db/schema";
import { apiInternal, be, err, nullEmptyStrings, vf } from "@/app/_lib/utils";
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
  be.number(id, "receipt ID");
  be.number(groupId, "group ID");
  be.number(paidById, "paidBy ID");
  be.string(paidOn, "paid on");
  be.number(flags, "receipt flags");
  be.array(items, "receipt items");

  const safeReceipt = {
    id,
    groupId,
    paidById,
    paidOn,
    flags,
    items: items.map(({ id, categoryId, flags, cost, notes, itemShares }) => {
      be.number(id, "item ID");
      be.number(categoryId, "item's category ID");
      be.number(cost, "item cost");
      be.number(flags, "item flags");
      be.stringOrNull(notes, "item notes");
      be.array(itemShares, "item shares");

      const safeItem = {
        id,
        categoryId,
        flags,
        cost,
        notes,
        itemShares: itemShares.map(({ userId, share }) => {
          be.number(userId, "userId of item share");
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
  revisedById: User["id"],
  { items: itemMods, ...receiptMod }: ReturnType<typeof validateReceipt>,
): Promise<Receipt> {
  return atomic(revisedById, async (tx, revisionId) => {
    const fromSrv = await tx.query.receipts.findFirst({
      with: {
        items: { with: { itemShares: true } },
        group: { columns: { flags: true } },
      },
      where: { id: receiptMod.id },
    });

    if (!fromSrv) err("receipt not found", { args: { receiptMod } });

    if (!vf(fromSrv.group).active)
      err("Modifying a receipt of a disabled group is not allowed!");

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      revisedById,
    });

    // checking what changed in old data first
    for (const avoidCrashingDebugger of srvItems) {
      // https://chatgpt.com/share/69121a51-3304-800b-86db-e448eff3ac9e
      const { itemShares: srvItemShares, ...item } = avoidCrashingDebugger;

      let cliItem = itemMods.find((i) => i.id === item.id);

      // item has been deleted on the client side
      if (!cliItem) {
        cliItem = { ...item, itemShares: [] };
        vf(cliItem).active = false;
      }

      const { itemShares: cliItemShares, ...itemModifier } = cliItem;

      changes += await modEntity(item, itemModifier, {
        tx,
        tableName: "items",
        revisionId,
        primaryKeys: { id: true },
        unchangedThrows: false,
        revisedById,
      });

      for (const oldItemShare of srvItemShares) {
        let modItemShare = cliItemShares.find(
          (mod) =>
            mod.userId === oldItemShare.userId &&
            itemModifier.id === oldItemShare.itemId,
        );

        // itemShare has been deleted on the client side: shouldn't occur,
        // since pre-existing shares simply get 0 value when "deleted"
        if (!modItemShare) {
          modItemShare = { ...oldItemShare };
          vf(cliItem).active = false;
        }

        changes += await modEntity(oldItemShare, modItemShare, {
          tx,
          tableName: "itemShares",
          revisionId,
          primaryKeys: { itemId: true, userId: true },
          revisedById,
          unchangedThrows: false,
        });
      }

      const newItemShares = cliItemShares.filter(
        (mod) =>
          !srvItemShares.some(
            // `modItem.id` because client side shares only store `userId` and `share`
            (old) =>
              old.itemId === itemModifier.id && old.userId === mod.userId,
          ),
      );

      if (newItemShares.length) {
        changes += newItemShares.length;

        await tx.insert(itemShares).values(
          newItemShares.map((nsh) => ({
            ...nsh,
            itemId: itemModifier.id,
            revisionId,
          })),
        );
      }
    }

    // checking if any item was added
    const newItems = itemMods.filter(
      (mi) => !srvItems.some((oi) => oi.id === mi.id),
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
          })),
        );
      }
    }

    if (changes === 0)
      err("No changes were made", { info: "updating receipt" });

    return await populateReceiptArchivesRecursively(receipt.id, tx);
  });
}
