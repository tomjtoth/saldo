import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TGroup } from "../models";
import { insertAlphabetically } from "../utils";

type State = TGroup[];

const slice = createSlice({
  name: "groups",
  initialState: [] as State,

  reducers: {
    init: (_, { payload }: PayloadAction<State>) => payload,

    update: (groups, { payload }: PayloadAction<TGroup>) => {
      const popFrom = groups.findIndex(({ id }) => id === payload.id)!;
      groups.splice(popFrom, 1);
      insertAlphabetically(payload, groups);
    },

    add: (groups, { payload }: PayloadAction<TGroup>) => {
      insertAlphabetically(payload, groups);
    },
  },
});

const sa = slice.actions;

export const rGroups = {
  init: (groups: TGroup[]) => (dispatch: AppDispatch) => {
    return dispatch(sa.init(groups));
  },

  update: (group: TGroup) => (dispatch: AppDispatch) => {
    return dispatch(sa.update(group));
  },

  add: (group: TGroup) => (dispatch: AppDispatch) => {
    return dispatch(sa.add(group));
  },
};

export default slice.reducer;
