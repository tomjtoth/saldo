import { PayloadAction } from "@reduxjs/toolkit";

import { Category } from "..";
import { insertAlphabetically } from "@/app/_lib/utils";
import { CombinedState as CS } from "@/app/_lib/reducers/types";
import { Group } from "@/app/groups/_lib";

export const sliceCategories = {
  modCategory(rs: CS, { payload }: PayloadAction<Category>) {
    const { categories } = rs.groups.find((g) => g.id === payload.groupId)!;

    const popFrom = categories.findIndex(({ id }) => id === payload.id);
    categories.splice(popFrom, 1);
    insertAlphabetically(payload, categories);
  },

  addCategory(rs: CS, { payload }: PayloadAction<Category>) {
    const group = rs.groups.find((g) => g.id === payload.groupId)!;
    const cats = group.categories;

    insertAlphabetically(payload, cats);
  },

  setDefaultCategoryId(
    rs: CS,
    {
      payload,
    }: PayloadAction<{
      groupId: Group["id"];
      categoryId?: Category["id"] | null;
    }>
  ) {
    const group = rs.groups.find((grp) => grp.id === payload.groupId)!;
    const ms = group.memberships.find((ms) => ms.userId === rs.user!.id)!;

    if (payload.categoryId !== undefined)
      ms.defaultCategoryId = payload.categoryId;
  },
};
