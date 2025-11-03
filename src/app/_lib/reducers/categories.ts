import { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import { AppDispatch } from "@/app/_lib/store";
import { TCategory } from "@/app/_lib/db";
import {
  appToast,
  has3ConsecutiveLetters,
  insertAlphabetically,
  nulledEmptyStrings,
} from "@/app/_lib/utils";
import { CombinedState as CS, combinedSA as csa } from ".";
import {
  svcCreateCategory,
  svcSetDefaultCategory,
  svcUpdateCategory,
} from "@/app/_lib/services";

export const rCategories = {
  updateCategory(rs: CS, { payload }: PayloadAction<TCategory>) {
    const cats = rs.groups.find((g) => g.id === payload.groupId)!.categories!;

    const popFrom = cats.findIndex(({ id }) => id === payload.id)!;
    cats.splice(popFrom, 1);
    insertAlphabetically(payload, cats);
  },

  addCategory(rs: CS, { payload }: PayloadAction<TCategory>) {
    const group = rs.groups.find((g) => g.id === payload.groupId)!;
    const cats = group.categories!;

    insertAlphabetically(payload, cats);
  },

  updateDefaultCategoryId(
    rs: CS,
    { payload }: PayloadAction<{ groupId: number; categoryId: number }>
  ) {
    const group = rs.groups.find((grp) => grp.id === payload.groupId)!;
    const ms = group.memberships?.at(0);

    ms!.defaultCategoryId = payload.categoryId;
  },
};

export const tCategories = {
  updateCategory:
    (original: TCategory, modifiers: TCategory) => (dispatch: AppDispatch) => {
      try {
        has3ConsecutiveLetters(modifiers.name!);
      } catch (err) {
        toast.error((err as Error).message, appToast.theme());
        throw err;
      }

      const crudOp = svcUpdateCategory(original.id!, modifiers).then((res) => {
        dispatch(csa.updateCategory(res));

        return `${appToast.opsDone(original, nulledEmptyStrings(modifiers))} "${
          original.name
        }" succeeded!`;
      });

      appToast.promise(crudOp, `Updating "${modifiers.name}"`);

      return crudOp;
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

      const op = svcCreateCategory({ groupId, name, description }).then(
        (res) => {
          dispatch(csa.addCategory(res));
        }
      );

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
