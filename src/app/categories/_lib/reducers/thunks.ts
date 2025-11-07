import { toast } from "react-toastify";

import { AppDispatch } from "@/app/_lib/store";
import { TCategory } from "@/app/_lib/db";
import {
  appToast,
  has3ConsecutiveLetters,
  nulledEmptyStrings,
} from "@/app/_lib/utils";
import { csa } from "@/app/_lib/reducers/slice";
import { apiAddCategory, apiSetDefaultCategory, apiUpdateCategory } from "..";

export const thunksCategories = {
  updateCategory:
    (original: TCategory, modifiers: TCategory) => (dispatch: AppDispatch) => {
      try {
        has3ConsecutiveLetters(modifiers.name!);
      } catch (err) {
        toast.error((err as Error).message, appToast.theme());
        throw err;
      }

      const crudOp = apiUpdateCategory({ ...modifiers, id: original.id! }).then(
        (res) => {
          dispatch(csa.updateCategory(res));

          return `${appToast.opsDone(
            original,
            nulledEmptyStrings(modifiers)
          )} "${original.name}" succeeded!`;
        }
      );

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

      const op = apiAddCategory({ groupId, name, description }).then((res) => {
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

      const op = apiSetDefaultCategory(categoryId!).catch((err) => {
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
