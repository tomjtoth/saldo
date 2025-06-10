import { configureStore } from "@reduxjs/toolkit";

import categories from "./reducers/categories";
import receipts from "./reducers/receipts";

export const makeStore = () => {
  return configureStore({
    reducer: {
      categories,
      receipts,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
