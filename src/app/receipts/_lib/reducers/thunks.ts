import { AppDispatch } from "@/app/_lib/store";
import { csa } from "@/app/_lib/reducers/slice";
import { Group } from "@/app/groups/_lib";
import { Item, Receipt } from "../populateRecursively";
import { ItemModifier } from "./slices";
import { callApi } from "@/app/_lib/utils";
import { User } from "@/app/(users)/_lib";

export const thunksReceipts = {
  setPaidOn: (date: Receipt["paidOn"]) => (dispatch: AppDispatch) => {
    return dispatch(csa.setPaidOn(date));
  },

  setPaidBy: (userId: User["id"]) => (dispatch: AppDispatch) => {
    return dispatch(csa.setPaidBy(userId));
  },

  addRow: (afterId?: Item["id"]) => (dispatch: AppDispatch) => {
    return dispatch(csa.addRow(afterId));
  },

  rmRow: (rowId: Item["id"]) => (dispatch: AppDispatch) => {
    return dispatch(csa.rmRow(rowId));
  },

  setFocusedRow: (index: Item["id"]) => (dispatch: AppDispatch) => {
    return dispatch(csa.setFocusedRow(index));
  },

  modItem: (modifier: ItemModifier) => {
    return (dispatch: AppDispatch) => dispatch(csa.modItem(modifier));
  },

  modReceipt: (rcpt: Receipt) => {
    return (dispatch: AppDispatch) => dispatch(csa.modReceipt(rcpt));
  },

  addReceipt: (rcpt: Receipt) => {
    return (dispatch: AppDispatch) => dispatch(csa.addReceipt(rcpt));
  },

  fetchReceipts:
    (groupId: Group["id"], knownIds: Receipt["id"][]) =>
    async (dispatch: AppDispatch) => {
      const receipts = await callApi.getReceipts(groupId, knownIds);

      dispatch(csa.addFetchedReceipts({ groupId, receipts }));
    },

  tryFetchingReceipts: () => (dispatch: AppDispatch) => {
    return dispatch(csa.tryFetchingReceipts());
  },

  setActiveReceipt: (id?: Receipt["id"]) => {
    return (dispatch: AppDispatch) => dispatch(csa.setActiveReceipt(id));
  },
};
