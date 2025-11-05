import { AppDispatch } from "@/app/_lib/store";
import { csa } from "@/app/_lib/reducers/slice";
import { TCliItem } from "@/app/_lib/reducers/types";
import { TReceipt, TGroup } from "@/app/_lib/db";

export const thunksReceipts = {
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
