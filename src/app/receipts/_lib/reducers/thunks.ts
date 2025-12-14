import { AppDispatch } from "@/app/_lib/store";
import { csa } from "@/app/_lib/reducers/slice";
import { Group } from "@/app/groups/_lib";
import { Item, Receipt } from "../populateRecursively";
import { ItemModifier } from "./slices";
import { callApi } from "@/app/_lib/utils/apiCalls";
import { User } from "@/app/(users)/_lib";
import { appToast } from "@/app/_lib/utils";

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
      return appToast.promise("Fetching receipts", async () => {
        const receipts = await callApi.getReceipts(groupId, knownIds);

        dispatch(csa.addFetchedReceipts({ groupId, receipts }));

        const toastMessage = receipts.length
          ? `Got ${receipts.length} receipts more.`
          : "There are no more receipts in this group.";

        return toastMessage;
      });
    },

  tryFetchingReceipts: () => (dispatch: AppDispatch) => {
    return dispatch(csa.tryFetchingReceipts());
  },

  setActiveReceipt: (id?: Receipt["id"]) => {
    return (dispatch: AppDispatch) => dispatch(csa.setActiveReceipt(id));
  },
};
