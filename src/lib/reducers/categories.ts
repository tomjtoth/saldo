import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TCliCategory, TStatus } from "../models";
import { WritableDraft } from "immer";

type State = {
  cats: TCliCategory[];
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

    update: (rs, { payload }: PayloadAction<TCliCategory>) => {
      let popFrom = -1;

      rs.cats.forEach((cat, idx) => {
        if (cat.id === payload.id) {
          if (cat.description !== payload.description) {
            popFrom = idx;
            cat.description = payload.description;
          }
          cat.statusId = payload.statusId;
        }
      });

      if (popFrom > -1) {
        const [modified] = rs.cats.splice(popFrom, 1);
        insertAlphabetically(modified, rs.cats);
      }
    },

    add: (rs, { payload }: PayloadAction<TCliCategory>) => {
      insertAlphabetically(payload, rs.cats);
    },
  },
});

function insertAlphabetically(
  payload: TCliCategory,
  cats: WritableDraft<TCliCategory[]>
) {
  const insertAt = cats.findIndex(
    (cat) => cat.description.toLowerCase() > payload.description.toLowerCase()
  );

  cats.splice(insertAt > -1 ? insertAt : cats.length, 0, payload);
}

const sa = slice.actions;

export const rCats = {
  init: (data: State) => (dispatch: AppDispatch) => {
    return dispatch(sa.init(data));
  },

  update: (cat: TCliCategory) => (dispatch: AppDispatch) => {
    return dispatch(sa.update(cat));
  },

  add: (cat: TCliCategory) => (dispatch: AppDispatch) => {
    return dispatch(sa.add(cat));
  },
};

export default slice.reducer;
