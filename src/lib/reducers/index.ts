import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TGroup } from "../models";
import { rCategories, tCategories } from "./categories";
import { rGroups, tGroups } from "./groups";
import { ReceiptState, rReceipts, tReceipts } from "./receipts";

export * from "./receipts";

export type CombinedState = {
  userId?: number;
  groupId?: number;
  groups: TGroup[];
  defaultGroupId?: number;
  newReceipts: {
    [key: number]: ReceiptState;
  };
};

type Initializer = Pick<CombinedState, "groups" | "defaultGroupId"> & {
  userId?: number;
};

const slice = createSlice({
  name: "combined",
  initialState: { groups: [], newReceipts: {} } as CombinedState,

  reducers: {
    init: (rs, { payload }: PayloadAction<Initializer>) => {
      if (rs.groupId === undefined) {
        rs.groupId = payload.defaultGroupId ?? payload.groups.at(0)?.id;
      }
      rs.defaultGroupId = payload.defaultGroupId;
      rs.groups = payload.groups;

      if (payload.userId !== undefined) rs.userId = payload.userId;
    },

    ...rGroups,
    ...rCategories,
    ...rReceipts,
  },
});

export const combinedSA = slice.actions;

export const rCombined = {
  init: (data: Initializer) => (dispatch: AppDispatch) => {
    return dispatch(combinedSA.init(data));
  },

  ...tGroups,
  ...tCategories,
  ...tReceipts,
};

export default slice.reducer;
