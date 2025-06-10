import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TCategory, TItem, TUser } from "../models";
import { TCLiReceiptAdder } from "@/components/receipts";

type State = {
  paidOn: string;
  paidBy: number;
  users: TUser[];
  categories: TCategory[];
  items: TCliItem[];
};

type TCliItem = Omit<TItem, "rcptId" | "revId" | "statusId">;

type TItemUpdater = Pick<TItem, "id"> & Partial<Omit<TItem, "id">>;

// this provides the key prop to React during `items.map( ... )`
let rowId = 0;
const addItem = (catId?: number) => ({
  id: rowId++,
  catId: catId ?? 0,
  cost: 0,
});

const slice = createSlice({
  name: "receipt-adder",
  initialState: {
    paidOn: new Date().toISOString().slice(0, 10),
    paidBy: 1,
    users: [],
    categories: [],
    items: [],
  } as State,

  reducers: {
    init: (rs, { payload }) => {
      rs.users = payload.users;
      rs.categories = payload.categories;
      rs.paidBy = payload.paidBy;

      // TODO: impl storing this in the users's settings on the server
      // and passing it to redux here
      const defaultCatId = 0;
      rs.items.push(addItem(defaultCatId));
    },

    addRow: (rs, { payload }: PayloadAction<number>) => {
      const idx = rs.items.findIndex((i) => i.id === payload);
      rs.items.splice(
        idx + 1,
        0,
        // inherit the upper row's categoryId
        addItem(idx > 0 ? rs.items[idx - 1].catId : undefined)
      );
    },

    rmRow: (rs, { payload }: PayloadAction<number>) => {
      const idx = rs.items.findIndex((i) => i.id === payload);

      rs.items.splice(idx, 1);
    },

    setPaidOn: (rs, { payload }: PayloadAction<string>) => {
      rs.paidOn = payload;
    },

    setPaidBy: (rs, { payload }: PayloadAction<number>) => {
      rs.paidBy = payload;
    },

    updateItem: (rs, { payload }: PayloadAction<TItemUpdater>) => {
      const item = rs.items.find((i) => i.id === payload.id)!;
      if (payload.catId) item.catId = Number(payload.catId) ?? 0;
      if (payload.cost) item.cost = payload.cost;
      if (payload.notes) item.notes = payload.notes;
      if (payload.shares) item.shares = payload.shares;
    },
  },
});

const sa = slice.actions;

export const initReceiptAdder = (fromDB: TCLiReceiptAdder) => {
  return (dispatch: AppDispatch) => dispatch(sa.init(fromDB));
};

export const setPaidOn = (date: string) => (dispatch: AppDispatch) => {
  return dispatch(sa.setPaidOn(date));
};

export const setPaidBy = (strUserId: string) => (dispatch: AppDispatch) => {
  return dispatch(sa.setPaidBy(Number(strUserId)));
};

export const addRow = (afterId: number) => (dispatch: AppDispatch) => {
  return dispatch(sa.addRow(afterId));
};

export const rmRow = (rowId: number) => (dispatch: AppDispatch) => {
  return dispatch(sa.rmRow(rowId));
};

export const updateItem = (updater: TItemUpdater) => {
  return (dispatch: AppDispatch) => dispatch(sa.updateItem(updater));
};

export default slice.reducer;
