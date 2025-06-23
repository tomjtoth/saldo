import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TGroup } from "../models";
import { rCategories, tCategories } from "./categories";
import { rGroups, tGroups } from "./groups";

export * from "./receipts";

export type CombinedState = {
  groupId?: number;
  groups: TGroup[];
  defaultGroupId?: number;
};

type Initializer = Pick<CombinedState, "groups" | "defaultGroupId">;

const slice = createSlice({
  name: "combined",
  initialState: { groups: [] } as CombinedState,

  reducers: {
    init: (rs, { payload }: PayloadAction<Initializer>) => {
      if (rs.groupId === undefined) {
        rs.groupId = payload.defaultGroupId ?? payload.groups.at(0)?.id;
      }
      rs.groups = payload.groups;
    },

    ...rGroups,
    ...rCategories,
  },
});

export const combinedSA = slice.actions;

export const rCombined = {
  init: (data: Initializer) => (dispatch: AppDispatch) => {
    return dispatch(combinedSA.init(data));
  },

  ...tGroups,
  ...tCategories,
};

export default slice.reducer;
