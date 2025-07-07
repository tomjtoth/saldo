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

type TNamedScrollHandler = {
  name: string;
  handler: UIEventHandler<HTMLDivElement>;
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
  const handlers = useRef<TNamedScrollHandler[]>([]);

  const addOnScroll = useCallback(
    (name: string, handler: UIEventHandler<HTMLDivElement>) => {
      handlers.current.push({ name, handler });
    },
    []
  );

  const rmOnScroll = useCallback((name: string) => {
    handlers.current = handlers.current.filter((x) => x.name !== name);
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
        addOnScroll,
        rmOnScroll,
        userMenu,
        groups: srv.groups ?? [],
        groupId,
        rootDivRef,
      }}
    >
      <div
        className="h-full flex flex-col overflow-scroll"
        onScroll={(ev) => {
          handlers.current.forEach(({ handler }) => handler(ev));
        }}
        ref={rootDivRef}
      >
        {children}
      </div>
    </RootDivCx.Provider>
  );
}

const RootDivCx = createContext<{
  addOnScroll: (name: string, handler: UIEventHandler<HTMLDivElement>) => void;
  rmOnScroll: (name: string) => void;
  userMenu: ReactNode;
  groups: TGroup[];
  groupId?: number;
  rootDivRef?: RefObject<HTMLDivElement | null>;
}>({
  addOnScroll: () => {},
  rmOnScroll: () => {},
  userMenu: null,
  groups: [],
});

export function useRootDivCx() {
  return useContext(RootDivCx);
}
