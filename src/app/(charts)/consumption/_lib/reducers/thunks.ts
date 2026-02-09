import { csa } from "@/app/_lib/reducers/slice";
import { AppDispatch } from "@/app/_lib/store";
import { appToast } from "@/app/_lib/utils";
import { callApi } from "@/app/_lib/utils/apiCalls";
import { ConsumptionOpts } from "../query";
import { Category } from "@/app/categories/_lib";

export const thunksConsumption = {
  updateConsumption: (opts: ConsumptionOpts) => (dispatch: AppDispatch) => {
    return appToast.promise(
      "Fetching data",
      callApi.getConsumption(opts).then((data) => {
        dispatch(csa.updateConsumptionData(data));
      })
    );
  },

  /**
   * in the consumption view
   */
  toggleCategoryVisibility:
    (categoryId: Category["id"]) => (dispatch: AppDispatch) => {
      dispatch(csa.toggleCategoryVisibility(categoryId));

      return appToast.promise(
        "Toggling category",
        callApi.toggleCategoryVisibility(categoryId).catch((err) => {
          dispatch(csa.toggleCategoryVisibility(categoryId));
          throw err;
        })
      );
    },
};
