import { configureStore } from "@reduxjs/toolkit";

import { slice } from "./reducers/slice";

export const makeStore = () =>
  configureStore({ reducer: { combined: slice.reducer } });

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootStateGetter = AppStore["getState"];
export type RootState = ReturnType<RootStateGetter>;
export type AppDispatch = AppStore["dispatch"];
