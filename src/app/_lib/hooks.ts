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
import { is } from "./utils";
import { Receipt } from "../receipts/_lib";
import { User } from "../(users)/_lib";

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

/**
 * @returns all groups from reducer state
 */
export function useClientState(key: "groups"): CombinedState["groups"];

/**
 * @returns the logged in user
 */
export function useClientState(key: "user"): CombinedState["user"];

/**
 * @returns reducer state's groupId
 */
export function useClientState(key: "groupId"): CombinedState["groupId"];

/**
 * @returns current group's balance data
 */
export function useClientState(key: "balance"): CliGroup["balance"] | undefined;

/**
 * @returns current group's consumption data
 */
export function useClientState(key: "consumption"): CliGroup["consumption"];

/**
 * @returns current group's category by ID
 */
export function useClientState(
  key: "category",
  categoryId: Category["id"]
): Category | undefined;

/**
 * @returns current group's category by ID
 */
export function useClientState(key: "categories[id]"): {
  [categoryId: Category["id"]]: Category;
};

/**
 * @returns current group's receipt by ID
 */
export function useClientState(
  key: "receipt",
  receiptId: Receipt["id"]
): CliGroup["receipts"][number] | undefined;

/**
 * @param groupId selects group by this Id if passed
 * @returns one group, defaults to current group
 */
export function useClientState(
  key: "group",
  groupId?: CliGroup["id"]
): CliGroup | undefined;

/**
 * @returns an array of users mapped from current group's memberships
 */
export function useClientState(
  key: "users"
): CliGroup["memberships"][number]["user"][];

/**
 * @returns an object that provides O(1) access to any user of the current group
 */
export function useClientState(key: "users[id]"): {
  [userId: User["id"]]: CliGroup["memberships"][number]["user"];
};

export function useClientState(
  key:
    | keyof CombinedState
    | "balance"
    | "consumption"
    | "category"
    | "categories[id]"
    | "group"
    | "receipt"
    | "users"
    | "users[id]",
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

    return groups.find(
      (group) => group.id === (key === "group" ? id ?? groupId : groupId)
    );
  });

  if (["user", "groupId", "groups"].includes(key)) return res;

  const group = res as CliGroup | undefined;

  if (key === "users" || key === "users[id]") {
    const dep = group?.memberships
      .flatMap((ms) => [ms.flags, ms.user.color, ms.defaultCategoryId])
      .join("-");

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(() => {
      const users = group?.memberships.map((ms) => ms.user) ?? [];

      if (key === "users[id]") {
        return Object.fromEntries(users.map((u) => [u.id, u]));
      }

      return users;
    }, [group?.memberships, dep]);
  }

  if (key === "category") {
    return group?.categories.find((category) => category.id === id);
  }

  if (key === "categories[id]") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(
      () => Object.fromEntries(group?.categories.map((c) => [c.id, c]) ?? []),
      [group?.categories]
    );
  }

  if (key === "balance") {
    return group?.balance;
  }

  if (key === "consumption") {
    return group?.consumption ?? [];
  }

  if (key === "receipt") return group?.receipts.find((r) => r.id === id);

  return res;
}

type DependencyObject = { [name: string]: DependencyList[number] };

export const useDebugger: {
  (message: string, deps: DependencyList): void;
  (callback: EffectCallback, deps: DependencyList): void;
  (depsAsObject: DependencyObject): void;
} = (
  strObjFn: EffectCallback | string | DependencyObject,
  deps?: DependencyList
) => {
  if (process.env.NODE_ENV === "development") {
    let hook: EffectCallback;

    if (is.object(strObjFn) && !is.function(strObjFn)) {
      deps = Object.values(strObjFn);
      hook = () =>
        console.debug(
          "noticed changes in: ",
          Object.keys(strObjFn).join(", "),
          ...(deps as DependencyList)
        );
    } else {
      hook = is.function(strObjFn) ? strObjFn : () => console.debug(strObjFn);
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(hook, deps);
  }
};

export const useBodyNodes = () => useContext(BodyNodeCx);

export const useRootDivCx = () => useContext(RootDivCx);
