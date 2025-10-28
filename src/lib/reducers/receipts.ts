import { PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { combinedSA as csa, CombinedState as CS, Initializer } from ".";
import { TReceipt, TGroup } from "@/lib/db";
import { VDate } from "../utils";

export type TCliReceipt = {
  paidOn: string;
  paidBy: number;
  items: TCliItem[];
  focusedIdx?: number;
};

export type TCliItem = {
  id: number;
  categoryId: number;
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
const addItem = (categoryId: number) => ({
  id: rowId++,
  categoryId,
  cost: "",
  notes: "",
  shares: {},
});

function currentReceipt(rs: CS) {
  let current = rs.newReceipts[rs.groupId!];

  if (!current) {
    current = {
      paidOn: VDate.toStrISO(),
      paidBy: rs.user!.id!,
      items: [],
    };

    rs.newReceipts[rs.groupId!] = current;
  }

  return current;
}

export function addEmptyReceipts(data: Initializer) {
  data.groups?.forEach((group) => {
    group.receipts?.push({
      id: -1,
      paidOn: VDate.toStrISO(),
      paidById: data.user!.id,
      items: [],
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
    const curr = currentReceipt(rs);
    curr.paidOn = payload;
  },

  setPaidBy(rs: CS, { payload }: PayloadAction<number>) {
    const curr = currentReceipt(rs);
    curr.paidBy = payload;
  },

  addRow(rs: CS, { payload }: PayloadAction<number | undefined>) {
    const curr = currentReceipt(rs);

    if (payload !== undefined) {
      const idx = curr.items.findIndex((i) => i.id === payload);
      curr.focusedIdx = idx + 1;
      curr.items.splice(
        idx + 1,
        0,
        // inherit categoryId from the row above
        addItem(curr.items[idx].categoryId)
      );
    } else {
      const group = rs.groups.find((group) => group.id === rs.groupId)!;
      const defCat =
        group.memberships?.at(0)?.defaultCategoryId ??
        group.categories!.at(0)!.id!;

      curr.items.push(addItem(defCat));
    }
  },

  rmRow(rs: CS, { payload }: PayloadAction<number>) {
    const curr = currentReceipt(rs);
    const idx = curr.items.findIndex((i) => i.id === payload);

    curr.items.splice(idx, 1);
  },

  setFocusedRow(rs: CS, { payload }: PayloadAction<number>) {
    const curr = currentReceipt(rs);
    curr.focusedIdx = payload;
  },

  updateItem(rs: CS, { payload }: PayloadAction<TItemUpdater>) {
    const curr = currentReceipt(rs);

    const item = curr.items.find((i) => i.id === payload.id)!;
    if (payload.categoryId !== undefined) item.categoryId = payload.categoryId;
    if (payload.cost !== undefined) item.cost = payload.cost;
    if (payload.notes !== undefined) item.notes = payload.notes;
    if (payload.shares !== undefined) item.shares = payload.shares;
  },

  addReceipt(rs: CS, { payload }: PayloadAction<TReceipt>) {
    const receipts = rs.groups.find((group) => group.id === payload.groupId)!
      .receipts!;

    const insertAt = receipts.findIndex((r) => r.paidOn! < payload.paidOn!);

    receipts.splice(insertAt < 0 ? 0 : insertAt, 0, payload);

    delete rs.newReceipts[payload.groupId!];
  },

  addFetchedReceipts(rs: CS, { payload }: PayloadAction<TGroup[]>) {
    payload.forEach((grp) => {
      rs.groups
        .find((group) => group.id === grp.id)
        ?.receipts?.push(...grp.receipts!);
    });

    sortReceipts(rs.groups);
  },

  setActiveReceipt(rs: CS, { payload }: PayloadAction<number | null>) {
    const group = rs.groups.find((g) => g.id === rs.groupId)!;

    if (typeof payload === "number") {
      const activeReceipt = group.receipts!.find(
        (rcpt) => rcpt.id === payload
      )!;

      group.receipts!.active = activeReceipt;
    } else {
      delete group.receipts!["active"];
    }
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

  addReceipt: (rcpt: TReceipt) => {
    return (dispatch: AppDispatch) => dispatch(csa.addReceipt(rcpt));
  },

  addFetchedReceipts: (groups: TGroup[]) => {
    return (dispatch: AppDispatch) => dispatch(csa.addFetchedReceipts(groups));
  },

  setActiveReceipt: (id: number | null) => {
    return (dispatch: AppDispatch) => dispatch(csa.setActiveReceipt(id));
  },
};
