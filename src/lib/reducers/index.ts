import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TGroup } from "../models";
import { rCategories, tCategories } from "./categories";
import { rGroups, tGroups } from "./groups";

export type CombinedState = {
  groupId?: number;
  groups: TGroup[];
};

const slice = createSlice({
  name: "combined",
  initialState: { groups: [] } as CombinedState,

  reducers: {
    init: (rs, { payload }: PayloadAction<TGroup[]>) => {
      if (rs.groupId === undefined) rs.groupId = payload.at(0)?.id;
      rs.groups = payload;
    },

    setGroupId: (rs, { payload }: PayloadAction<number>) => {
      rs.groupId = payload;
    },

    ...rGroups,
    ...rCategories,
  },
});

export const combinedSA = slice.actions;

export const rCombined = {
  init: (groups: TGroup[]) => (dispatch: AppDispatch) => {
    return dispatch(combinedSA.init(groups));
  },

  setGroupId: (groupId: number) => (dispatch: AppDispatch) => {
    return dispatch(combinedSA.setGroupId(groupId));
  },

  ...tGroups,
  ...tCategories,
};

export default slice.reducer;
