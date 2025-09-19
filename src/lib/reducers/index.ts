import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TGroup } from "@/lib/db";
import { rCategories, tCategories } from "./categories";
import { rGroups, tGroups } from "./groups";
import { TCliReceipt, rReceipts, tReceipts } from "./receipts";

export * from "./receipts";

export type CombinedState = {
  user?: {
    id: number;
    flags: number;
  };
  groupId?: number;
  groups: TGroup[];
  defaultGroupId?: number;
  newReceipts: {
    [key: number]: TCliReceipt;
  };
};

export type Initializer = Pick<CombinedState, "groups" | "defaultGroupId"> & {
  user?: { id: number; flags: number };
};

const slice = createSlice({
  name: "combined",
  initialState: { groups: [], newReceipts: {} } as CombinedState,

  reducers: {
    init: (rs, { payload }: PayloadAction<Initializer>) => {
      if (rs.groupId === undefined) {
        rs.groupId = payload.defaultGroupId ?? payload.groups.at(0)?.id;
      }

      if (payload.defaultGroupId !== undefined)
        rs.defaultGroupId = payload.defaultGroupId;

      rs.groups = payload.groups;

      if (payload.user !== undefined) rs.user = payload.user;
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
