import { PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch, RootState } from "../store";
import { TCategory } from "@/lib/db";
import {
  appToast,
  has3ConsecutiveLetters,
  insertAlphabetically,
} from "../utils";
import { CombinedState as CS, combinedSA as csa } from ".";
import {
  svcCreateCategory,
  svcSetDefaultCategory,
} from "../services/categories";
import { toast } from "react-toastify";

export const rCategories = {
  updateCat: (rs: CS, { payload }: PayloadAction<TCategory>) => {
    const cats = rs.groups.find((g) => g.id === payload.groupId)!.categories!;

    const popFrom = cats.findIndex(({ id }) => id === payload.id)!;
    cats.splice(popFrom, 1);
    insertAlphabetically(payload, cats);
  },

  addCategory: (rs: CS, { payload }: PayloadAction<TCategory>) => {
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

  addCategory:
    (groupId: number, name: string, description: string) =>
    async (dispatch: AppDispatch) => {
      try {
        has3ConsecutiveLetters(name);
      } catch (err) {
        toast.error((err as Error).message as string, appToast.theme());
        throw err;
      }

      const op = svcCreateCategory(groupId, name, description).then((res) => {
        dispatch(csa.addCategory(res));
      });

      appToast.promise(op, `Saving "${name}" to db`);

      return op;
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

      const op = svcSetDefaultCategory(categoryId!).catch((err) => {
        dispatch(
          csa.updateDefaultCategoryId({
            categoryId: fallback,
            groupId,
          })
        );

        throw err;
      });

      appToast.promise(op, "Setting default category");

      return op;
    },
};
