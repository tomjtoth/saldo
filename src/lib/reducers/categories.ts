import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TCategory, TStatus } from "../models";
import { WritableDraft } from "immer";

type State = {
  cats: TCategory[];
  stats: TStatus[];
};

const slice = createSlice({
  name: "categories",
  initialState: {
    cats: [],
    stats: [],
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

function insertAlphabetically(
  payload: TCategory,
  cats: WritableDraft<TCategory[]>
) {
  const insertAt = cats.findIndex(
    (cat) => cat.description.toLowerCase() > payload.description.toLowerCase()
  );

  cats.splice(insertAt > -1 ? insertAt : cats.length, 0, payload);
}

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
