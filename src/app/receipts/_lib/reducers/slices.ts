import { PayloadAction } from "@reduxjs/toolkit";

import { Item, Receipt } from "../populateRecursively";
import { Group } from "@/app/groups/_lib";
import { deepClone } from "@/app/_lib/utils";
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
    const receipt = getActiveReceipt(rs);
    receipt.paidOn = payload;
  },

  setPaidBy(rs: CS, { payload }: PayloadAction<Receipt["paidById"]>) {
    const receipt = getActiveReceipt(rs);
    const users = getActiveUsers(rs);
    const user = users.find((u) => u.id === payload)!;

    receipt.paidBy = user;
    receipt.paidById = payload;
  },

  addRow(rs: CS, { payload }: PayloadAction<Item["id"] | undefined>) {
    const receipt = getActiveReceipt(rs);

    if (payload !== undefined) {
      const idx = receipt.items.findIndex((i) => i.id === payload);
      receipt.focusedIdx = idx + 1;
      receipt.items.splice(
        idx + 1,
        0,
        // inherit categoryId from the row above
        addItem(receipt.items[idx].categoryId)
      );
    } else {
      const group = getActiveGroup(rs);

      if (group) {
        const defCat = getDefaultCategory(rs, group.id);
        receipt.items.push(addItem(defCat));
      }
    }
  },

  rmRow(rs: CS, { payload }: PayloadAction<Item["id"]>) {
    const receipt = getActiveReceipt(rs);
    const idx = receipt.items.findIndex((i) => i.id === payload);

    receipt.items.splice(idx, 1);
  },

  setFocusedRow(rs: CS, { payload }: PayloadAction<number>) {
    const receipt = getActiveReceipt(rs);
    receipt.focusedIdx = payload;
  },

  modItem(rs: CS, { payload }: PayloadAction<ItemModifier>) {
    const receipt = getActiveReceipt(rs);

    const item = receipt.items.find((i) => i.id === payload.id)!;
    if (payload.categoryId !== undefined) item.categoryId = payload.categoryId;
    if (payload.cost !== undefined) item.cost = payload.cost;
    if (payload.notes !== undefined) item.notes = payload.notes;
    if (payload.itemShares !== undefined) item.itemShares = payload.itemShares;
  },

  modReceipt(rs: CS, { payload }: PayloadAction<Receipt>) {
    const group = getActiveGroup(rs, payload.groupId);

    const insertAt = group.receipts.findIndex((r) => r.id === payload.id);

    group.receipts.splice(insertAt, 1, payload);

    delete group["activeReceipt"];
  },

  addReceipt(rs: CS, { payload }: PayloadAction<Receipt>) {
    const group = getActiveGroup(rs, payload.groupId);

    const insertAt = group.receipts.findIndex((r) => r.paidOn < payload.paidOn);

    group.receipts.splice(insertAt < 0 ? 0 : insertAt, 0, payload);

    delete group["activeReceipt"];
  },

  addFetchedReceipts(
    rs: CS,
    { payload }: PayloadAction<{ groupId: Group["id"]; receipts: Receipt[] }>
  ) {
    const group = getActiveGroup(rs, payload.groupId);

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
    const group = getActiveGroup(rs);

    group.debounceReceiptsFetching = (group.debounceReceiptsFetching ?? 0) + 1;
  },

  setActiveReceipt(
    rs: CS,
    { payload }: PayloadAction<Receipt["id"] | undefined>
  ) {
    const group = getActiveGroup(rs);

    if (typeof payload === "number") {
      const activeReceipt = group.receipts.find((rcpt) => rcpt.id === payload);

      const detachedClone = deepClone(activeReceipt);
      group.activeReceipt = detachedClone;
    } else {
      delete group["activeReceipt"];
    }
  },
};
