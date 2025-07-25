import { PayloadAction } from "@reduxjs/toolkit";
import { DateTime } from "luxon";

import { AppDispatch } from "../store";
import { combinedSA as csa, CombinedState as CS } from ".";
import { Receipt, TGroup } from "../models";
import { EUROPE_HELSINKI } from "../utils";

export type TCliReceipt = {
  paidOn: string;
  paidBy: number;
  items: TCliItem[];
  focusedIdx?: number;
};

export type TCliItem = {
  id: number;
  catId: number;
  cost: string;
  notes: string;
  shares: {
    [key: number]: number;
  };
};

type TItemUpdater = Pick<TCliItem, "id"> & Partial<Omit<TCliItem, "id">>;

// this provides the key prop to React during `items.map( ... )`
// TODO: enable drag n drop re-arrangement of items in adder
let rowId = 0;
const addItem = (catId: number) => ({
  id: rowId++,
  catId,
  cost: "",
  notes: "",
  shares: {},
});

function currentReceipt(rs: CS) {
  let current = rs.newReceipts[rs.groupId!];

  if (!current) {
    current = {
      paidOn: DateTime.local(EUROPE_HELSINKI).toISODate(),
      paidBy: rs.userId!,
      items: [],
    };

    rs.newReceipts[rs.groupId!] = current;
  }

  return current;
}

export const sortReceipts = (groups: TGroup[]) =>
  groups.forEach((group) =>
    group.Receipts?.sort((a, b) =>
      a.paidOn < b.paidOn ? 1 : a.paidOn > b.paidOn ? -1 : 0
    )
  );

export const rReceipts = {
  setPaidOn: (rs: CS, { payload }: PayloadAction<string>) => {
    const curr = currentReceipt(rs);
    curr.paidOn = payload;
  },

  setPaidBy: (rs: CS, { payload }: PayloadAction<number>) => {
    const curr = currentReceipt(rs);
    curr.paidBy = payload;
  },

  addRow: (rs: CS, { payload }: PayloadAction<number | undefined>) => {
    const curr = currentReceipt(rs);

    if (payload !== undefined) {
      const idx = curr.items.findIndex((i) => i.id === payload);
      curr.focusedIdx = idx + 1;
      curr.items.splice(
        idx + 1,
        0,
        // inherit the upper row's categoryId
        addItem(curr.items[idx].catId)
      );
    } else {
      const group = rs.groups.find((group) => group.id === rs.groupId)!;
      const defCat =
        group.Memberships?.at(0)?.defaultCatId ?? group.Categories!.at(0)!.id!;

      curr.items.push(addItem(defCat));
    }
  },

  rmRow: (rs: CS, { payload }: PayloadAction<number>) => {
    const curr = currentReceipt(rs);
    const idx = curr.items.findIndex((i) => i.id === payload);

    curr.items.splice(idx, 1);
  },

  setFocusedRow: (rs: CS, { payload }: PayloadAction<number>) => {
    const curr = currentReceipt(rs);
    curr.focusedIdx = payload;
  },

  updateItem: (rs: CS, { payload }: PayloadAction<TItemUpdater>) => {
    const curr = currentReceipt(rs);

    const item = curr.items.find((i) => i.id === payload.id)!;
    if (payload.catId !== undefined) item.catId = payload.catId;
    if (payload.cost !== undefined) item.cost = payload.cost;
    if (payload.notes !== undefined) item.notes = payload.notes;
    if (payload.shares !== undefined) item.shares = payload.shares;
  },

  addReceipt: (rs: CS, { payload }: PayloadAction<Receipt>) => {
    rs.groups
      .find((group) => group.id === payload.groupId)
      ?.Receipts?.splice(0, 0, payload);

    delete rs.newReceipts[payload.groupId];
  },

  addFetchedReceipts: (rs: CS, { payload }: PayloadAction<TGroup[]>) => {
    payload.forEach((grp) => {
      rs.groups
        .find((group) => group.id === grp.id)
        ?.Receipts?.push(...grp.Receipts!);
    });

    sortReceipts(rs.groups);
  },
};

export const tReceipts = {
  setPaidOn: (date: string) => (dispatch: AppDispatch) => {
    return dispatch(csa.setPaidOn(date));
  },

  setPaidBy: (strUserId: string) => (dispatch: AppDispatch) => {
    return dispatch(csa.setPaidBy(Number(strUserId)));
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

  updateItem: (updater: TItemUpdater) => {
    return (dispatch: AppDispatch) => dispatch(csa.updateItem(updater));
  },

  addReceipt: (rcpt: Receipt) => {
    return (dispatch: AppDispatch) => dispatch(csa.addReceipt(rcpt));
  },

  addFetchedReceipts: (groups: TGroup[]) => {
    return (dispatch: AppDispatch) => dispatch(csa.addFetchedReceipts(groups));
  },
};
