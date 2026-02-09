import { PayloadAction } from "@reduxjs/toolkit";
import { CombinedState as CS } from "@/app/_lib/reducers/types";
import { ConsumptionDataViaAPI } from "../getConsumption";
import { Category } from "@/app/categories/_lib";

export const sliceConsumption = {
  updateConsumptionData(
    rs: CS,
    { payload }: PayloadAction<ConsumptionDataViaAPI>
  ) {
    rs.groups.forEach((group) => (group.consumption = payload[group.id]));
  },

  toggleCategoryVisibility(rs: CS, { payload }: PayloadAction<Category["id"]>) {
    const u = rs.user!;
    const arr = u.categoriesHiddenFromConsumption;

    if (arr.includes(payload)) {
      u.categoriesHiddenFromConsumption = arr.filter((cid) => cid !== payload);
    } else {
      u.categoriesHiddenFromConsumption.push(payload);
    }
  },
};
