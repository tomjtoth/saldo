import { PayloadAction } from "@reduxjs/toolkit";

import { TReceipt, TGroup } from "@/app/_lib/db";
import { deepClone } from "@/app/_lib/utils";
import { CombinedState as CS, TCliItem } from "@/app/_lib/reducers/types";
import {
  addItem,
  getActiveGroup,
  getActiveReceipt,
  getActiveUsers,
  getDefaultCategory,
  sortReceipts,
} from "./helpers";

export const sliceReceipts = {
  setPaidOn(rs: CS, { payload }: PayloadAction<string>) {
    const receipt = getActiveReceipt(rs);
    receipt.paidOn = payload;
  },

  setPaidBy(rs: CS, { payload }: PayloadAction<number>) {
    const receipt = getActiveReceipt(rs);
    const users = getActiveUsers(rs);
    const user = users?.find((u) => u.id === payload);

    receipt.paidBy = user;
    receipt.paidById = payload;
  },

  addRow(rs: CS, { payload }: PayloadAction<number | undefined>) {
    const receipt = getActiveReceipt(rs);

    if (payload !== undefined) {
      const idx = receipt.items!.findIndex((i) => i.id === payload);
      receipt.focusedIdx = idx + 1;
      receipt.items!.splice(
        idx + 1,
        0,
        // inherit categoryId from the row above
        addItem(receipt.items![idx].categoryId!)
      );
    } else {
      const group = getActiveGroup(rs);

      if (group) {
        const defCat = getDefaultCategory(rs, group.id);
        receipt.items!.push(addItem(defCat));
      }
    }
  },

  rmRow(rs: CS, { payload }: PayloadAction<number>) {
    const receipt = getActiveReceipt(rs);
    const idx = receipt.items!.findIndex((i) => i.id === payload);

    receipt.items!.splice(idx, 1);
  },

  setFocusedRow(rs: CS, { payload }: PayloadAction<number>) {
    const receipt = getActiveReceipt(rs);
    receipt.focusedIdx = payload;
  },

  modItem(rs: CS, { payload }: PayloadAction<TCliItem>) {
    const receipt = getActiveReceipt(rs);

    const item = receipt.items!.find((i) => i.id === payload.id)!;
    if (payload.categoryId !== undefined) item.categoryId = payload.categoryId;
    if (payload.cost !== undefined) item.cost = payload.cost;
    if (payload.notes !== undefined) item.notes = payload.notes;
    if (payload.itemShares !== undefined) item.itemShares = payload.itemShares;
  },

  modReceipt(rs: CS, { payload }: PayloadAction<TReceipt>) {
    const group = getActiveGroup(rs, payload.groupId);

    const insertAt = group.receipts!.findIndex((r) => r.id === payload.id);

    group.receipts!.splice(insertAt, 1, payload);

    delete group["activeReceipt"];
  },

  addReceipt(rs: CS, { payload }: PayloadAction<TReceipt>) {
    const group = getActiveGroup(rs, payload.groupId);

    const insertAt = group.receipts!.findIndex(
      (r) => r.paidOn! < payload.paidOn!
    );

    group.receipts!.splice(insertAt < 0 ? 0 : insertAt, 0, payload);

    delete group["activeReceipt"];
  },

  addFetchedReceipts(rs: CS, { payload }: PayloadAction<TGroup[]>) {
    payload.forEach((grp) => {
      rs.groups
        .find((group) => group.id === grp.id)
        ?.receipts?.push(...grp.receipts!);
    });

    sortReceipts(rs.groups);
  },

  setActiveReceipt(rs: CS, { payload }: PayloadAction<number | undefined>) {
    const group = getActiveGroup(rs);

    if (typeof payload === "number") {
      const activeReceipt = group.receipts?.find((rcpt) => rcpt.id === payload);

      const detachedClone = deepClone(activeReceipt);
      group.activeReceipt = detachedClone;
    } else {
      delete group["activeReceipt"];
    }
  },
};
