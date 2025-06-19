import { PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TCategory } from "../models";
import { insertAlphabetically } from "../utils";
import { CombinedState, combinedSA as sa } from ".";

export const rCategories = {
  updateCat: (rs: CombinedState, { payload }: PayloadAction<TCategory>) => {
    const cats = rs.groups.find((g) => g.id === payload.groupId)!.Categories!;

    const popFrom = cats.findIndex(({ id }) => id === payload.id)!;
    cats.splice(popFrom, 1);
    insertAlphabetically(payload, cats);
  },

  addCat: (rs: CombinedState, { payload }: PayloadAction<TCategory>) => {
    const group = rs.groups.find((g) => g.id === payload.groupId)!;
    const cats = group?.Categories!;

    insertAlphabetically(payload, cats);
  },
};

export const tCategories = {
  updateCat: (cat: TCategory) => (dispatch: AppDispatch) => {
    return dispatch(sa.updateCat(cat));
  },

  addCat: (cat: TCategory) => (dispatch: AppDispatch) => {
    return dispatch(sa.addCat(cat));
  },
};
