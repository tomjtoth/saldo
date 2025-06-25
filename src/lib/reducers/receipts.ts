import { PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TItem } from "../models";
import { combinedSA as csa, CombinedState as CS } from ".";

export type ReceiptState = {
  paidOn: string;
  paidBy?: number;
  items: TCliItem[];
  focusedIdx?: number;
};

export type TCliItem = Omit<TItem, "rcptId" | "revId" | "statusId" | "cost"> & {
  cost: string;
};

type TItemUpdater = Pick<TCliItem, "id"> & Partial<Omit<TCliItem, "id">>;

// this provides the key prop to React during `items.map( ... )`
let rowId = 0;
const addItem = (catId: number) => ({
  id: rowId++,
  catId: catId,
  cost: "",
  notes: "",
});

function currentReceipt(rs: CS) {
  let current = rs.newReceipts[rs.groupId!];

  if (!current) {
    current = {
      paidOn: new Date().toISOString().slice(0, 10),
      items: [],
    };

    rs.newReceipts[rs.groupId!] = current;
  }

  return current;
}

export const rReceipts = {
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
        group.Memberships!.at(0)!.defaultCatId ?? group.Categories!.at(0)!.id!;

      curr.items.push(addItem(defCat));
    }
  },

  rmRow: (rs: CS, { payload }: PayloadAction<number>) => {
    const curr = currentReceipt(rs);
    const idx = curr.items.findIndex((i) => i.id === payload);

    curr.items.splice(idx, 1);
  },

  setPaidOn: (rs: CS, { payload }: PayloadAction<string>) => {
    const curr = currentReceipt(rs);
    curr.paidOn = payload;
  },

  setPaidBy: (rs: CS, { payload }: PayloadAction<number>) => {
    const curr = currentReceipt(rs);
    curr.paidBy = payload;
  },

  updateItem: (rs: CS, { payload }: PayloadAction<TItemUpdater>) => {
    const curr = currentReceipt(rs);

    const item = curr.items.find((i) => i.id === payload.id)!;
    if (payload.catId !== undefined) item.catId = Number(payload.catId) ?? 0;
    if (payload.cost !== undefined) item.cost = payload.cost;
    if (payload.notes !== undefined) item.notes = payload.notes;
    if (payload.shares !== undefined) item.shares = payload.shares;
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

  updateItem: (updater: TItemUpdater) => {
    return (dispatch: AppDispatch) => dispatch(csa.updateItem(updater));
  },
};
