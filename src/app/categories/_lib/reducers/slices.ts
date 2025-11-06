import { PayloadAction } from "@reduxjs/toolkit";

import { TCategory } from "@/app/_lib/db";
import { insertAlphabetically } from "@/app/_lib/utils";
import { CombinedState as CS } from "@/app/_lib/reducers/types";

export const sliceCategories = {
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
