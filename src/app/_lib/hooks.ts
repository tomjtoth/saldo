import {
  useCallback,
  useRef,
  useEffect,
  useContext,
  useMemo,
  EffectCallback,
  DependencyList,
} from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import type { RootState, AppDispatch, AppStore } from "./store";

import { RootDivCx } from "@/app/_components/rootDiv";
import { BodyNodeCx } from "@/app/_components/bodyNodes";
import { CliGroup, CombinedState } from "./reducers/types";
import { Category } from "../categories/_lib";

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

export function useClientState(key: "balance"): CliGroup["balance"];
export function useClientState(key: "consumption"): CliGroup["consumption"];

export function useClientState(
  key: "category",
  categoryId: Category["id"]
): CliGroup["categories"][number] | undefined;

export function useClientState(
  key: "group",
  groupId?: CliGroup["id"]
): CliGroup | undefined;

export function useClientState(
  key: "users"
): CliGroup["memberships"][number]["user"][];

export function useClientState(
  key:
    | keyof CombinedState
    | "balance"
    | "consumption"
    | "category"
    | "group"
    | "users",
  id?: number
) {
  const fallback = useRootDivCx();

  const res = useAppSelector((s) => {
    const local = s.combined;

    if (key === "user") return local.user ?? fallback.user;

    const groupId = local.groupId ?? fallback.groupId;
    if (key === "groupId") return groupId;

    const groups =
      local.groups.length === 0 && fallback.groups.length > 0
        ? fallback.groups
        : local.groups;
    if (key === "groups") return groups;

    return groups.find((group) => group.id === (id ?? groupId));
  });

  if (["user", "groupId", "groups"].includes(key)) return res;

  const group = res as CliGroup | undefined;

  if (key === "users") {
    const dep = group?.memberships
      .flatMap((ms) => [ms.flags, ms.user.color, ms.defaultCategoryId])
      .join("-");

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(
      () => group?.memberships.map((ms) => ms.user) ?? [],
      [group?.memberships, dep]
    );
  }

  if (key === "category") {
    return group?.categories.find((category) => category.id === id);
  }

  if (key === "balance") {
    return group?.balance;
  }

  if (key === "consumption") {
    return group?.consumption;
  }

  return res;
}

export function useDebugger(
  fnOrMsg: EffectCallback | string,
  ...deps: DependencyList
) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(
      typeof fnOrMsg === "function" ? fnOrMsg : () => console.debug(fnOrMsg),
      deps
    );
  }
}

export const useBodyNodes = () => useContext(BodyNodeCx);

export const useRootDivCx = () => useContext(RootDivCx);
