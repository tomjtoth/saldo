import { AppDispatch } from "../store";
import { thunksCategories } from "@/app/categories/_lib/reducers";
import { thunksGroups } from "@/app/groups/_lib/reducers";
import { thunksReceipts } from "@/app/receipts/_lib/reducers";
import { slice } from "./slice";
import { CombinedState } from "./types";
import { thunksConsumption } from "@/app/(charts)/consumption/_lib/reducers/thunks";

export const thunks = {
  init: (data: CombinedState) => (dispatch: AppDispatch) => {
    return dispatch(slice.actions.init(data));
  },

  ...thunksGroups,
  ...thunksCategories,
  ...thunksReceipts,
  ...thunksConsumption,
};
