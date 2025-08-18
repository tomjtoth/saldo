import { PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TCategory } from "@/lib/db";
import { insertAlphabetically } from "../utils";
import { CombinedState as CS, combinedSA as csa } from ".";

type DefaultCatIdUpdater = { groupId: number; catId: number };

export const rCategories = {
  updateCat: (rs: CS, { payload }: PayloadAction<TCategory>) => {
    const cats = rs.groups.find((g) => g.id === payload.groupId)!.categories!;

    const popFrom = cats.findIndex(({ id }) => id === payload.id)!;
    cats.splice(popFrom, 1);
    insertAlphabetically(payload, cats);
  },

  addCat: (rs: CS, { payload }: PayloadAction<TCategory>) => {
    const group = rs.groups.find((g) => g.id === payload.groupId)!;
    const cats = group.categories!;

    insertAlphabetically(payload, cats);
  },

  updateDefaultCatId: (
    rs: CS,
    { payload }: PayloadAction<DefaultCatIdUpdater>
  ) => {
    const group = rs.groups.find((grp) => grp.id === payload.groupId)!;
    const ms = group.memberships?.at(0);

    ms!.defaultCategoryId = payload.catId;
  },
};

export const tCategories = {
  updateCat: (cat: TCategory) => (dispatch: AppDispatch) => {
    return dispatch(csa.updateCat(cat));
  },

  addCat: (cat: TCategory) => (dispatch: AppDispatch) => {
    return dispatch(csa.addCat(cat));
  },

  updateDefaultCatId:
    (data: DefaultCatIdUpdater) => (dispatch: AppDispatch) => {
      return dispatch(csa.updateDefaultCatId(data));
    },
};
