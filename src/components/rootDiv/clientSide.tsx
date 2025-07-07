"use client";

import {
  createContext,
  ReactNode,
  RefObject,
  UIEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import { useAppDispatch } from "@/lib/hooks";
import { TGroup } from "@/lib/models";
import { Initializer, rCombined } from "@/lib/reducers";

export type TRootDiv = {
  children: ReactNode;

  rewritePath?: string;
  userId?: number;

  groupId?: number;
  defaultGroupId?: number;
  groups?: TGroup[];
};

export default function CliRootDiv({
  children,
  userMenu,
  rewritePath,

  groupId,
  ...srv
}: TRootDiv & {
  userMenu: ReactNode;
}) {
  const scrollHandler = useRef<UIEventHandler<HTMLDivElement>>(null);
  const setOnScroll = useCallback((handler: UIEventHandler<HTMLDivElement>) => {
    scrollHandler.current = handler;
  }, []);
  const rootDivRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (srv.groups)
      // rendered on protectedPages
      dispatch(rCombined.init(srv as Initializer));

    if (groupId) {
      if (rewritePath) window.history.replaceState(null, "", rewritePath);
      dispatch(rCombined.setGroupId(groupId));
    }
  }, []);

  return (
    <RootDivCx.Provider
      value={{
        setOnScroll,
        userMenu,
        groups: srv.groups ?? [],
        groupId,
        rootDivRef,
      }}
    >
      <div
        className="h-full flex flex-col overflow-scroll"
        onScroll={(ev) => scrollHandler.current?.(ev)}
        ref={rootDivRef}
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
  rootDivRef?: RefObject<HTMLDivElement | null>;
}>({
  setOnScroll: () => {},
  userMenu: null,
  groups: [],
});

export function useRootDivCx() {
  return useContext(RootDivCx);
}
