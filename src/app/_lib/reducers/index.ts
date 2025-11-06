import { AppDispatch } from "../store";
import { thunksCategories } from "@/app/categories/_lib/reducers";
import { thunksGroups } from "@/app/groups/_lib/reducers";
import { thunksReceipts } from "@/app/receipts/_lib/reducers";
import { addEmptyReceipts } from "@/app/receipts/_lib/reducers/helpers";
import { deepClone } from "../utils";
import { slice } from "./slice";
import { Initializer } from "./types";

export const rCombined = {
  init: (data: Initializer) => (dispatch: AppDispatch) => {
    // must clone here, because Redux freezes the object async(?)
    // and by the 2nd iteration in the next fn it threw errors...
    const clone = deepClone(data);
    addEmptyReceipts(clone);

    return dispatch(slice.actions.init(clone));
  },

  ...thunksGroups,
  ...thunksCategories,
  ...thunksReceipts,
};
