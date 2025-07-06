import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import type { RootState, AppDispatch, AppStore } from "./store";
import { rCombined } from "./reducers";
import { useRootDivCx } from "@/components/rootDiv/clientSide";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

// TODO: rename to useGroupState
export const useGroupSelector = () => {
  const dispatch = useAppDispatch();

  const fallback = useRootDivCx();
  const groupId = useAppSelector((s) => s.combined.groupId ?? fallback.groupId);
  const groups = useAppSelector((s) => {
    const local = s.combined.groups;
    return local.length > 0 ? local : fallback.groups;
  });

  const group = () => groups.find((group) => group.id === groupId);

  useEffect(() => {
    if (groups.length > 0 && !group())
      dispatch(rCombined.setGroupId(groups[0].id));
  }, [groups]);

  return { groups, groupId, group };
};
