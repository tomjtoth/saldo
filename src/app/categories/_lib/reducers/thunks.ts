import { toast } from "react-toastify";

import { AppDispatch } from "@/app/_lib/store";
import {
  appToast,
  has3ConsecutiveLetters,
  nullEmptyStrings,
} from "@/app/_lib/utils";
import { csa } from "@/app/_lib/reducers/slice";
import {
  apiAddCategory,
  apiModCategory,
  Category,
  CategoryAdder,
  CategoryModifier,
} from "..";
import { Group } from "@/app/groups/_lib";
import { apiSetDefaultCategory } from "@/app/(memberships)/_lib";

export const thunksCategories = {
  modCategory:
    (original: Category, modifiers: Required<Omit<CategoryModifier, "id">>) =>
    (dispatch: AppDispatch) => {
      try {
        has3ConsecutiveLetters(modifiers.name);
      } catch (err) {
        toast.error((err as Error).message, appToast.theme());
        throw err;
      }

      const crudOp = apiModCategory({ ...modifiers, id: original.id }).then(
        (res) => {
          dispatch(csa.modCategory(res));

          return `${appToast.opsDone(original, nullEmptyStrings(modifiers))} "${
            original.name
          }" succeeded!`;
        }
      );

      appToast.promise(crudOp, `Updating "${modifiers.name}"`);

      return crudOp;
    },

  addCategory: (args: CategoryAdder) => async (dispatch: AppDispatch) => {
    try {
      has3ConsecutiveLetters(args.name);
    } catch (err) {
      toast.error((err as Error).message as string, appToast.theme());
      throw err;
    }

    const op = apiAddCategory(args).then((res) => {
      dispatch(csa.addCategory(res));
    });

    appToast.promise(op, `Saving "${args.name}" to db`);

    return op;
  },

  modDefaultCategoryId:
    (
      categoryId: Category["id"],
      groupId: Group["id"],
      fallbackId?: Category["id"] | null
    ) =>
    (dispatch: AppDispatch) => {
      dispatch(csa.modDefaultCategoryId({ categoryId, groupId }));

      const op = apiSetDefaultCategory(categoryId).catch((err) => {
        dispatch(csa.modDefaultCategoryId({ categoryId: fallbackId, groupId }));

        throw err;
      });

      appToast.promise(op, "Setting default category");

      return op;
    },
};
