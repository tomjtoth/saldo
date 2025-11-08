"use client";

import {
  createContext,
  ReactNode,
  RefObject,
  UIEventHandler,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { useAppDispatch } from "@/app/_lib/hooks";
import { TGroup, TUser } from "@/app/_lib/db";
import { thunks } from "@/app/_lib/reducers";

import BodyNodeProvider from "./bodyNodes";

type TRootDiv = {
  children: ReactNode;

  rewritePath?: string;
  user?: TUser;

  groupId?: number;
  groups?: TGroup[];
};

type TNamedScrollHandler = {
  name: string;
  handler: UIEventHandler<HTMLDivElement>;
};

export const RootDivCx = createContext<{
  addOnScroll: (name: string, handler: UIEventHandler<HTMLDivElement>) => void;
  rmOnScroll: (name: string) => void;
  groups: TGroup[];
  groupId?: number;
  user?: TUser;
  rootDivRef?: RefObject<HTMLDivElement | null>;
}>({
  addOnScroll: () => {},
  rmOnScroll: () => {},
  groups: [],
});

export default function RootDiv({
  children,
  rewritePath,

  groupId,
  user,
  groups,
}: TRootDiv) {
  if (groups === undefined) groups = [];
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
    // rendered on protectedPages
    if (groups || user) dispatch(thunks.init({ groups, user }));

    if (groupId) {
      if (rewritePath) window.history.replaceState(null, "", rewritePath);
      dispatch(thunks.setGroupId(groupId));
    }
  }, []);

  return (
    <RootDivCx.Provider
      value={{
        addOnScroll,
        rmOnScroll,
        rootDivRef,
        groups,
        groupId,
        user,
      }}
    >
      <div
        className="h-full flex flex-col overflow-scroll"
        onScroll={(ev) => {
          handlers.current.forEach(({ handler }) => handler(ev));
        }}
        ref={rootDivRef}
      >
        <BodyNodeProvider>{children}</BodyNodeProvider>
      </div>
    </RootDivCx.Provider>
  );
}
