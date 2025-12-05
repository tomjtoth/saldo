import { csa } from "@/app/_lib/reducers/slice";
import { AppDispatch } from "@/app/_lib/store";
import { appToast, callApi } from "@/app/_lib/utils";
import { ConsumptionOpts } from "../query";

export const thunksConsumption = {
  updateConsumption: (opts: ConsumptionOpts) => (dispatch: AppDispatch) => {
    return appToast.promise(
      "Fetching data",
      callApi.getConsumption(opts).then((data) => {
        dispatch(csa.updateConsumptionData(data));
      })
    );
  },
};
