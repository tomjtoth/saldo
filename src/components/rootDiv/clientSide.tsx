"use client";

import {
  createContext,
  ReactNode,
  UIEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import { useAppDispatch } from "@/lib/hooks";
import { TGroup } from "@/lib/models";
import { rCombined } from "@/lib/reducers";

export type TSrv = {
  children: ReactNode;

  rewritePath?: string;
  userId?: number;

  groupId?: number;
  defaultGroupId?: number;
  groups: TGroup[];
};

export default function CliRootDiv({
  children,
  userMenu,
  rewritePath,

  groupId,
  ...srv
}: TSrv & {
  userMenu: ReactNode;
}) {
  const scrollHandler = useRef<UIEventHandler<HTMLDivElement>>(null);
  const setOnScroll = useCallback((handler: UIEventHandler<HTMLDivElement>) => {
    scrollHandler.current = handler;
  }, []);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(rCombined.init(srv));

    if (groupId) {
      if (rewritePath) window.history.replaceState(null, "", rewritePath);
      dispatch(rCombined.setGroupId(groupId));
    }
  }, []);

  return (
    <RootDivCx.Provider
      value={{ setOnScroll, userMenu, groups: srv.groups, groupId }}
    >
      <div
        className="h-full flex flex-col overflow-scroll"
        onScroll={(ev) => scrollHandler.current?.(ev)}
      >
        {children}
      </div>
    </RootDivCx.Provider>
  );
}

const RootDivCx = createContext<{
  setOnScroll: (handler: UIEventHandler<HTMLDivElement>) => void;
  userMenu: ReactNode;
  groups: TGroup[];
  groupId?: number;
}>({
  setOnScroll: () => {},
  userMenu: null,
  groups: [],
});

export function useRootDivCx() {
  return useContext(RootDivCx);
}
