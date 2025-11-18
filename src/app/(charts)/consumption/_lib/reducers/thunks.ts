import { csa } from "@/app/_lib/reducers/slice";
import { AppDispatch } from "@/app/_lib/store";
import { apiGetConsumption } from "../server";
import { appToast } from "@/app/_lib/utils";
import { ConsumptionOpts } from "../query";

export const thunksConsumption = {
  updateConsumption: (opts: ConsumptionOpts) => (dispatch: AppDispatch) => {
    const op = apiGetConsumption(opts).then((data) => {
      dispatch(csa.updateConsumptionData(data));
    });

    appToast.promise(op, "Fetching data");

    return op;
  },
};
