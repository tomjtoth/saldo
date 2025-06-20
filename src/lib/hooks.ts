import { useDispatch, useSelector, useStore } from "react-redux";

import type { RootState, AppDispatch, AppStore } from "./store";
import { TGroup } from "./models";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

export const useGroupSelector = (fallback: TGroup[]) =>
  useAppSelector((s) => {
    const local = s.combined.groups;
    return local.length > 0 ? local : fallback;
  });
