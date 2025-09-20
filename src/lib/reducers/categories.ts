import { PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch, RootState } from "../store";
import { TCategory } from "@/lib/db";
import { appToast, insertAlphabetically } from "../utils";
import { CombinedState as CS, combinedSA as csa } from ".";
import { svcSetDefaultCategory } from "../services/categories";

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

  updateDefaultCategoryId: (
    rs: CS,
    { payload }: PayloadAction<{ groupId: number; categoryId: number }>
  ) => {
    const group = rs.groups.find((grp) => grp.id === payload.groupId)!;
    const ms = group.memberships?.at(0);

    ms!.defaultCategoryId = payload.categoryId;
  },
};

export const tCategories = {
  updateCat: (cat: TCategory) => (dispatch: AppDispatch) => {
    return dispatch(csa.updateCat(cat));
  },

  addCat: (cat: TCategory) => (dispatch: AppDispatch) => {
    return dispatch(csa.addCat(cat));
  },

  updateDefaultCategoryId:
    (categoryId: number, groupId: number, fallback: number) =>
    (dispatch: AppDispatch) => {
      dispatch(
        csa.updateDefaultCategoryId({
          categoryId,
          groupId,
        })
      );

      const op = svcSetDefaultCategory(categoryId!).catch(() => {
        dispatch(
          csa.updateDefaultCategoryId({
            categoryId: fallback,
            groupId,
          })
        );
      });

      appToast.promise(op, "Setting default category");

      return op;
    },
};
