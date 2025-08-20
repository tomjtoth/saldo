import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import type { RootState, AppDispatch, AppStore } from "./store";
import { rCombined } from "./reducers";
import { useRootDivCx } from "@/components/rootDiv/clientSide";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

// TODO: rename to useClientState
export const useGroupSelector = () => {
  const dispatch = useAppDispatch();

  const fallback = useRootDivCx();
  const groups = useAppSelector((s) => {
    const local = s.combined.groups;
    return local.length > 0 ? local : fallback.groups;
  });

  const groupId = useAppSelector(
    (s) => s.combined.groupId ?? fallback.groupId ?? groups.at(0)?.id
  );

  const user = useAppSelector((s) => s.combined.user ?? fallback.user);

  // leave it as a function as it get's called from useEffect, too
  const getGroup = () => groups.find((group) => group.id === groupId);
  const group = getGroup();
  const users = group?.memberships?.map(({ user }) => user!) ?? [];

  // TODO: performance improvement
  // console.debug("useGroupSelector being called");

  useEffect(() => {
    if (groups.length > 0 && !getGroup())
      dispatch(rCombined.setGroupId(groups[0].id!));
  }, [groups]);

  return {
    groups,
    group,
    groupId,

    users,
    user,
  };
};
