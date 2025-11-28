import { AppDispatch } from "@/app/_lib/store";
import { appToast, be, nullEmptyStrings } from "@/app/_lib/utils";
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
      return appToast.promise(`Updating "${modifiers.name}"`, () => {
        be.stringWith3ConsecutiveLetters(modifiers.name, "name");

        return apiModCategory({ ...modifiers, id: original.id }).then((res) => {
          dispatch(csa.modCategory(res));

          return `${appToast.opsDone(original, nullEmptyStrings(modifiers))} "${
            original.name
          }" succeeded!`;
        });
      });
    },

  addCategory: (args: CategoryAdder) => async (dispatch: AppDispatch) => {
    return appToast.promise(`Saving "${args.name}" to db`, () => {
      be.stringWith3ConsecutiveLetters(args.name, "name");

      return apiAddCategory(args).then((res) => {
        dispatch(csa.addCategory(res));
      });
    });
  },

  modDefaultCategoryId:
    (
      categoryId: Category["id"],
      groupId: Group["id"],
      fallbackId?: Category["id"] | null
    ) =>
    (dispatch: AppDispatch) => {
      dispatch(csa.modDefaultCategoryId({ categoryId, groupId }));

      return appToast.promise(
        "Setting default category",

        apiSetDefaultCategory(categoryId).catch((err) => {
          dispatch(
            csa.modDefaultCategoryId({ categoryId: fallbackId, groupId })
          );

          throw err;
        })
      );
    },
};
