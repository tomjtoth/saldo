import { apiGetConsumption } from "@/app/(charts)/consumption/_lib/getConsumption";
import { apiToggleCategoryVisibility } from "@/app/(charts)/consumption/_lib/toggleCategory";
import {
  apiModMembership,
  apiSetDefaultCategory,
  apiSetUserColor,
} from "@/app/(memberships)/_lib";
import { apiAddCategory } from "@/app/categories/_lib/addCategory";
import { apiModCategory } from "@/app/categories/_lib/modCategory";
import { apiAddGroup } from "@/app/groups/_lib/addGroup";
import { apiModGroup } from "@/app/groups/_lib/modGroup";
import {
  apiGenInviteLink,
  apiRmInviteLink,
  apiSetDefaultGroup,
} from "@/app/groups/_lib/misc";
import { apiAddReceipt } from "@/app/receipts/_lib/addReceipt";
import { apiGetReceipts } from "@/app/receipts/_lib/getReceipts";
import { apiModReceipt } from "@/app/receipts/_lib/modReceipt";

const allApiCalls = {
  apiAddCategory,
  apiAddGroup,
  apiAddReceipt,
  apiGenInviteLink,
  apiGetConsumption,
  apiGetReceipts,
  apiModCategory,
  apiModGroup,
  apiModMembership,
  apiModReceipt,
  apiRmInviteLink,
  apiSetDefaultCategory,
  apiSetDefaultGroup,
  apiSetUserColor,
  apiToggleCategoryVisibility,
};

type UnwrapApiResult<F> = F extends (
  ...args: infer A
) => Promise<{ result?: infer R; error?: unknown }>
  ? (...args: A) => Promise<R>
  : never;

/* eslint-disable @typescript-eslint/no-explicit-any */
type TCallApi<T extends Record<string, any>> = {
  // K is the original key ("apiAddGroup")
  // Infer the rest of the key *after* "api"
  [K in keyof T as K extends `api${infer Rest}`
    ? // Transform "AddGroup" → "addGroup"
      Rest extends `${infer First}${infer Tail}`
      ? `${Lowercase<First>}${Tail}`
      : never
    : never]: UnwrapApiResult<T[K]>;
};

export const callApi: TCallApi<typeof allApiCalls> = new Proxy(
  allApiCalls as any,
  {
    get(target, prop: string | symbol, receiver) {
      if (typeof prop !== "string") return Reflect.get(target, prop, receiver);

      // Turn "addGroup" → "apiAddGroup"
      const originalKey = "api" + prop[0].toUpperCase() + prop.slice(1);

      const value = Reflect.get(target, originalKey, receiver);
      if (typeof value !== "function") return value;

      return async function (...args: any[]) {
        const { error, result } = await value.apply(target, args);

        if (error) throw new Error(error);

        return result;
      };
    },
  }
);

/* eslint-enable @typescript-eslint/no-explicit-any */
