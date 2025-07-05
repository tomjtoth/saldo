"use client";

import { createContext, ReactNode, useContext, useEffect } from "react";

import { useAppDispatch } from "@/lib/hooks";
import { rCombined } from "@/lib/reducers";
import { TGroup } from "@/lib/models";

const cx = createContext<ReactNode>(null);

export type TSrv = {
  userMenu: ReactNode;
  userId?: number;

  groupId?: number;
  defaultGroupId?: number;
  groups: TGroup[];
};

export default function CliCommonCx({
  children,
  rewritePath,
  srv: { userMenu, groupId, ...srv },
}: {
  children?: ReactNode;
  rewritePath?: string;
  srv: TSrv;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(rCombined.init(srv));

    if (groupId) {
      if (rewritePath) window.history.replaceState(null, "", rewritePath);
      dispatch(rCombined.setGroupId(groupId));
    }
  }, []);

  return <cx.Provider value={userMenu}>{children}</cx.Provider>;
}

export const useUserMenu = () => useContext(cx);
