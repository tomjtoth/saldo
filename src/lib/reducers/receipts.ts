import { PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import {
  combinedSA as csa,
  CombinedState as CS,
  Initializer,
  TCliItem,
} from ".";
import { TReceipt, TGroup, TItem } from "@/lib/db";
import { deepClone, VDate } from "../utils";

// this provides the key prop to React during `items.map( ... )`
// TODO: enable drag n drop re-arrangement of items in adder
let rowId = 0;
const addItem = (categoryId: number) => ({
  id: rowId++,
  categoryId,
  cost: "",
  notes: "",
  itemShares: [],
});

const getActiveGroup = (rs: CS, groupId?: number) =>
  rs.groups.find((grp) => grp.id === (groupId ?? rs.groupId))!;

const getDefaultCategory = (rs: CS, groupId?: number) => {
  const group = getActiveGroup(rs, groupId);

  return (
    group.memberships?.at(0)?.defaultCategoryId ?? group.categories!.at(0)!.id!
  );
};

const getActiveUsers = (rs: CS) =>
  getActiveGroup(rs).memberships?.map(({ user }) => user!);

const getActiveReceipt = (rs: CS) => getActiveGroup(rs).activeReceipt!;

export function addEmptyReceipts(data: Initializer) {
  data.groups?.forEach((group) => {
    group.receipts?.push({
      id: -1,
      paidOn: VDate.toStrISO(),
      paidById: data.user!.id,
      paidBy: data.user,
      items: [
        // cost is of type string on the client side, big deal! :'D
        addItem(getDefaultCategory(data as CS, group.id!)) as unknown as TItem,
      ],
    });
  });
}

const sortReceipts = (groups: TGroup[]) =>
  groups.forEach((group) =>
    group.receipts?.sort(({ paidOn: a }, { paidOn: b }) =>
      b! < a! ? -1 : b! > a! ? 1 : 0
    )
  );

export const rReceipts = {
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

  updateItem(rs: CS, { payload }: PayloadAction<TCliItem>) {
    const receipt = getActiveReceipt(rs);

    const item = receipt.items!.find((i) => i.id === payload.id)!;
    if (payload.categoryId !== undefined) item.categoryId = payload.categoryId;
    if (payload.cost !== undefined) item.cost = payload.cost;
    if (payload.notes !== undefined) item.notes = payload.notes;
    if (payload.itemShares !== undefined) item.itemShares = payload.itemShares;
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
      const activeReceipt = group.receipts!.find(
        (rcpt) => rcpt.id === payload
      )!;

      const detachedClone = deepClone(activeReceipt);
      group.activeReceipt = detachedClone;
    } else {
      delete group["activeReceipt"];
    }
  },
};

export const tReceipts = {
  setPaidOn: (date: string) => (dispatch: AppDispatch) => {
    return dispatch(csa.setPaidOn(date));
  },

  setPaidBy: (userId: number) => (dispatch: AppDispatch) => {
    return dispatch(csa.setPaidBy(userId));
  },

  addRow: (afterId?: number) => (dispatch: AppDispatch) => {
    return dispatch(csa.addRow(afterId));
  },

  rmRow: (rowId: number) => (dispatch: AppDispatch) => {
    return dispatch(csa.rmRow(rowId));
  },

  setFocusedRow: (index: number) => (dispatch: AppDispatch) => {
    return dispatch(csa.setFocusedRow(index));
  },

  updateItem: (updater: TCliItem) => {
    return (dispatch: AppDispatch) => dispatch(csa.updateItem(updater));
  },

  addReceipt: (rcpt: TReceipt) => {
    return (dispatch: AppDispatch) => dispatch(csa.addReceipt(rcpt));
  },

  addFetchedReceipts: (groups: TGroup[]) => {
    return (dispatch: AppDispatch) => dispatch(csa.addFetchedReceipts(groups));
  },

  setActiveReceipt: (id?: number) => {
    return (dispatch: AppDispatch) => dispatch(csa.setActiveReceipt(id));
  },
};
