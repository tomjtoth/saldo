import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TCategory, TGroup } from "../models";
import { insertAlphabetically } from "../utils";

type State = {
  cats: TCategory[];
  groups: Pick<TGroup, "id" | "name">[];
};

const slice = createSlice({
  name: "categories",
  initialState: {
    cats: [],
    groups: [],
  } as State,

  reducers: {
    init: (_, { payload }) => payload,

    update: (rs, { payload }: PayloadAction<TCategory>) => {
      const popFrom = rs.cats.findIndex(({ id }) => id === payload.id)!;
      rs.cats.splice(popFrom, 1);
      insertAlphabetically(payload, rs.cats);
    },

    add: (rs, { payload }: PayloadAction<TCategory>) => {
      insertAlphabetically(payload, rs.cats);
    },
  },
});

const sa = slice.actions;

export const rCategories = {
  init: (data: State) => (dispatch: AppDispatch) => {
    return dispatch(sa.init(data));
  },

  update: (cat: TCategory) => (dispatch: AppDispatch) => {
    return dispatch(sa.update(cat));
  },

  add: (cat: TCategory) => (dispatch: AppDispatch) => {
    return dispatch(sa.add(cat));
  },
};

export default slice.reducer;
