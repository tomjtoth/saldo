import { apiGetConsumption } from "@/app/(charts)/consumption/_lib";
import {
  apiModMembership,
  apiSetDefaultCategory,
  apiSetUserColor,
} from "@/app/(memberships)/_lib";
import { apiAddCategory, apiModCategory } from "@/app/categories/_lib";
import {
  apiAddGroup,
  apiGenInviteLink,
  apiModGroup,
  apiRmInviteLink,
  apiSetDefaultGroup,
} from "@/app/groups/_lib";
import {
  apiAddReceipt,
  apiGetReceipts,
  apiModReceipt,
} from "@/app/receipts/_lib";

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
};

type UnwrapApiResult<F> = F extends (
  ...args: infer A
) => Promise<{ result?: infer R; error?: any }>
  ? (...args: A) => Promise<R>
  : never;

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

        if (error) throw error;

        return result;
      };
    },
  }
);
