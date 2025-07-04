import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import type { RootState, AppDispatch, AppStore } from "./store";
import { TGroup } from "./models";
import { rCombined } from "./reducers";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

// TODO: rename to useGroupState
export const useGroupSelector = (fallback?: TGroup[]) => {
  const dispatch = useAppDispatch();

  const groupId = useAppSelector((s) => s.combined.groupId);
  const groups = useAppSelector((s) => {
    const local = s.combined.groups;
    return local.length > 0 ? local : fallback ?? [];
  });

  const group = () => groups.find((group) => group.id === groupId);

  useEffect(() => {
    if (groups.length > 0 && !group())
      dispatch(rCombined.setGroupId(groups[0].id));
  }, [groups]);

  return { groups, groupId, group };
};

export function useGroupIdPreselector(path: string, groupId?: number) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (groupId) {
      window.history.replaceState(null, "", path);
      dispatch(rCombined.setGroupId(groupId));
    }
  }, []);
}
