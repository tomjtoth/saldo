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
      try {
        be.stringWith3ConsecutiveLetters(modifiers.name, "name");

        return appToast.promise(
          apiModCategory({ ...modifiers, id: original.id }).then((res) => {
            dispatch(csa.modCategory(res));

            return `${appToast.opsDone(
              original,
              nullEmptyStrings(modifiers)
            )} "${original.name}" succeeded!`;
          }),
          `Updating "${modifiers.name}"`
        );
      } catch (err) {
        appToast.error(err);
      }
    },

  addCategory: (args: CategoryAdder) => async (dispatch: AppDispatch) => {
    try {
      be.stringWith3ConsecutiveLetters(args.name, "name");

      return appToast.promise(
        apiAddCategory(args).then((res) => {
          dispatch(csa.addCategory(res));
        }),
        `Saving "${args.name}" to db`
      );
    } catch (err) {
      appToast.error(err);
    }
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
        apiSetDefaultCategory(categoryId).catch((err) => {
          dispatch(
            csa.modDefaultCategoryId({ categoryId: fallbackId, groupId })
          );

          throw err;
        }),
        "Setting default category"
      );
    },
};
