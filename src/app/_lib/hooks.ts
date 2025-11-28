import { useCallback, useRef, useEffect, useContext } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import type { RootState, AppDispatch, AppStore } from "./store";

import { RootDivCx } from "@/app/_components/rootDiv";
import { BodyNodeCx } from "@/app/_components/bodyNodes";
import { CliGroup, CombinedState } from "./reducers/types";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<number>(-1);

  useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export function useClientState(key: "groups"): CombinedState["groups"];
export function useClientState(key: "user"): CombinedState["user"];
export function useClientState(key: "groupId"): CombinedState["groupId"];
export function useClientState(key: "group"): CombinedState["group"];
export function useClientState(key: "users"): CombinedState["users"];

export function useClientState(key: keyof CombinedState) {
  const fallback = useRootDivCx();

  return useAppSelector((s) => {
    const local = s.combined;

    if (
      key === "groups" &&
      local.groups.length === 0 &&
      fallback.groups.length > 0
    ) {
      const groups: CliGroup[] = fallback.groups;
      return groups;
    }

    if (key === "user" && !local.user && !!fallback.user) return fallback.user;

    return local[key];
  });
}

export const useBodyNodes = () => useContext(BodyNodeCx);

export const useRootDivCx = () => useContext(RootDivCx);
