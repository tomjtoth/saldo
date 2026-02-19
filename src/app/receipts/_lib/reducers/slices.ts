import { PayloadAction } from "@reduxjs/toolkit";

import { Item, Receipt } from "../populateRecursively";
import { Group } from "@/app/groups/_lib";
import { deepClone, VDate, vf } from "@/app/_lib/utils";
import { CombinedState as CS } from "@/app/_lib/reducers/types";
import {
  addItem,
  getActiveGroup,
  getActiveReceipt,
  getActiveUsers,
  getDefaultCategory,
  sortReceipts,
} from "./helpers";

export type ItemModifier = Pick<Item, "id"> &
  Partial<Pick<Item, "categoryId" | "cost" | "notes" | "itemShares">>;

export const sliceReceipts = {
  setPaidOn(rs: CS, { payload }: PayloadAction<Receipt["paidOn"]>) {
    const receipt = getActiveReceipt(rs)!;
    receipt.changes++;
    receipt.paidOn = payload;
  },

  setPaidBy(rs: CS, { payload }: PayloadAction<Receipt["paidById"]>) {
    const receipt = getActiveReceipt(rs)!;
    receipt.changes++;
    const users = getActiveUsers(rs)!;
    const user = users.find((u) => u.id === payload)!;

    receipt.paidBy = user;
    receipt.paidById = payload;
  },

  addItem(rs: CS, { payload }: PayloadAction<Item["id"] | undefined>) {
    const receipt = getActiveReceipt(rs)!;
    receipt.changes++;

    if (payload !== undefined) {
      const idx = receipt.items.findIndex((i) => i.id === payload);

      // inherit categoryId from the row above
      const newItem = addItem(receipt.items[idx].categoryId);
      receipt.items.splice(idx + 1, 0, newItem);
      receipt.focusedItemId = newItem.id;
    } else {
      const group = getActiveGroup(rs);

      if (group) {
        const defCat = getDefaultCategory(rs, group.id);
        receipt.items.push(addItem(defCat));
      }
    }
  },

  rmItem(rs: CS, { payload }: PayloadAction<Item["id"]>) {
    const receipt = getActiveReceipt(rs)!;
    receipt.changes++;
    const item = receipt.items.find((i) => i.id === payload)!;

    if (receipt.id === -1 || item.id < 0) {
      const idx = receipt.items.findIndex((i) => i.id === payload);
      receipt.items.splice(idx, 1);
      receipt.focusedItemId = receipt.items[Math.max(0, idx - 1)].id;
    } else {
      vf(item).toggleActive();
    }
  },

  focusItem(rs: CS, { payload }: PayloadAction<Item["id"] | undefined>) {
    const receipt = getActiveReceipt(rs)!;

    if (payload) receipt.focusedItemId = payload;
    else delete receipt.focusedItemId;
  },

  modItem(rs: CS, { payload }: PayloadAction<ItemModifier>) {
    const receipt = getActiveReceipt(rs)!;
    receipt.changes++;

    const item = receipt.items.find((i) => i.id === payload.id)!;
    if (payload.categoryId !== undefined) item.categoryId = payload.categoryId;
    if (payload.cost !== undefined) item.cost = payload.cost;
    if (payload.notes !== undefined) item.notes = payload.notes;
    if (payload.itemShares !== undefined) item.itemShares = payload.itemShares;
  },

  modReceipt(rs: CS, { payload }: PayloadAction<Receipt>) {
    const group = getActiveGroup(rs, payload.groupId)!;

    const insertAt = group.receipts.findIndex((r) => r.id === payload.id);

    group.receipts.splice(insertAt, 1, payload);

    delete group["activeReceipt"];
  },

  addReceipt(rs: CS, { payload }: PayloadAction<Receipt>) {
    const group = getActiveGroup(rs, payload.groupId)!;

    const insertAt = group.receipts.findIndex((r) => r.paidOn < payload.paidOn);

    group.receipts.splice(insertAt < 0 ? 0 : insertAt, 0, payload);

    delete group["activeReceipt"];
  },

  addFetchedReceipts(
    rs: CS,
    { payload }: PayloadAction<{ groupId: Group["id"]; receipts: Receipt[] }>,
  ) {
    const group = getActiveGroup(rs, payload.groupId)!;

    if (payload.receipts.length) {
      group.receipts.push(...payload.receipts);
      group.hasMoreToLoad = true;
      group.fetchingReceipts = false;
      group.debounceReceiptsFetching = 0;
      sortReceipts(rs.groups);
    } else {
      group.hasMoreToLoad = false;
    }
  },

  tryFetchingReceipts(rs: CS) {
    const group = getActiveGroup(rs)!;

    group.debounceReceiptsFetching = (group.debounceReceiptsFetching ?? 0) + 1;
  },

  setActiveReceipt(
    rs: CS,
    { payload }: PayloadAction<Receipt["id"] | undefined>,
  ) {
    const group = getActiveGroup(rs)!;

    if (typeof payload === "number") {
      const activeReceipt = group.receipts.find((rcpt) => rcpt.id === payload)!;
      if (payload === -1) activeReceipt.paidOn = VDate.toStrISO();

      const detachedClone = deepClone(activeReceipt);
      group.activeReceipt = { ...detachedClone, changes: 0 };
    } else {
      delete group["activeReceipt"];
    }
  },

  toggleActiveReceiptTemplate(rs: CS) {
    const receipt = getActiveGroup(rs)!.activeReceipt!;
    vf(receipt).toggleTemplate();
    receipt.changes++;
  },

  toggleReceiptItemsSummary(rs: CS, { payload }: PayloadAction<Receipt["id"]>) {
    if (payload in rs.showReceiptItemsSummary)
      delete rs.showReceiptItemsSummary[payload];
    else rs.showReceiptItemsSummary[payload] = true;
  },
};
