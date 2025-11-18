import { PayloadAction } from "@reduxjs/toolkit";
import { CombinedState as CS } from "@/app/_lib/reducers/types";
import { ConsumptionDataViaAPI } from "../server";

export const sliceConsumption = {
  updateConsumptionData(
    rs: CS,
    { payload }: PayloadAction<ConsumptionDataViaAPI>
  ) {
    rs.groups.forEach((group) => (group.consumption = payload[group.id]));
  },
};
