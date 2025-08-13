import { Draft, WritableDraft } from "immer";
import { DateTime, DateTimeJSOptions } from "luxon";
import { toast, ToastPromiseParams } from "react-toastify";

import { TCategory } from "@/lib/db";
import { Dispatch, SetStateAction } from "react";

export function approxFloat(value: number, maxDenominator = 1000) {
  if (value == 0.5) return [1, 2];

  let bestNumerator = 1;
  let bestDenominator = 1;
  let bestDifference = Math.abs(value - bestNumerator / bestDenominator);

  for (let denominator = 1; denominator <= maxDenominator; denominator++) {
    const numerator = Math.round(value * denominator);
    const difference = Math.abs(value - numerator / denominator);

    if (difference < bestDifference) {
      bestNumerator = numerator;
      bestDenominator = denominator;
      bestDifference = difference;
    }

    // Early exit if we find an exact match
    if (bestDifference === 0) break;
  }

  return [bestNumerator, bestDenominator];
}

export const EUROPE_HELSINKI = {
  zone: "Europe/Helsinki",
} satisfies DateTimeJSOptions;

const DT_FORMAT = "yyyy-MM-dd HH:mm:ss";

// TODO: store this in the DB for consistency with the data
export const DT_ANCHOR = DateTime.fromFormat(
  "2020-01-01",
  "y-M-d",
  EUROPE_HELSINKI
).toMillis();

const DAY = 24 * 60 * 60 * 1000;

export function dateFromInt(val: number) {
  const raw = val * DAY + DT_ANCHOR;
  const date = DateTime.fromMillis(raw, EUROPE_HELSINKI);

  return date.toISODate()!;
}

export function dateToInt(val?: string) {
  const date = val
    ? DateTime.fromFormat(val, "y-M-d", EUROPE_HELSINKI)
    : DateTime.local(EUROPE_HELSINKI);

  return Math.floor((date.toMillis() - DT_ANCHOR) / DAY);
}

export function datetimeFromInt(val?: number) {
  const date = val
    ? DateTime.fromMillis(val * 1000 + DT_ANCHOR, EUROPE_HELSINKI)
    : DateTime.local(EUROPE_HELSINKI);

  return date.toFormat(DT_FORMAT);
}

export function datetimeToInt(val?: DateTime | string) {
  if (
    typeof val === "string" &&
    ![DT_FORMAT, "y.M.d. H:m:s"].some((fmt) => {
      const parsed = DateTime.fromFormat(val as string, fmt, EUROPE_HELSINKI);
      if (parsed.isValid) {
        val = parsed;
        return true;
      }
    })
  )
    err("unparsable DateTime string");

  const millis = (
    (val as DateTime) ?? DateTime.local(EUROPE_HELSINKI)
  ).toMillis();
  return Math.round((millis - DT_ANCHOR) / 1000);
}

export async function sleep(ms: number) {
  return new Promise<void>((done) => setTimeout(done, ms));
}

type SendJsonOptions = {
  method?: "POST" | "PUT";
};

export async function sendJSON(
  endpoint: string,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  options?: SendJsonOptions
) {
  return await fetch(endpoint, {
    method: options?.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function err(msg?: string): never {
  throw new Error(msg);
}

const RE_3_CONSECUTIVE_LETTERS = /\p{Letter}{3,}/u;

export function has3ConsecutiveLetters(val: string) {
  if (!val.match(RE_3_CONSECUTIVE_LETTERS))
    err("must have at least 3 consecutive letters");
}

function opsDone<
  T extends Pick<TCategory, "name" | "description" | "statusId">
>(before: T, after: T) {
  const ops = [
    ...(after.name !== before.name ? ["renaming"] : []),
    ...(after.statusId !== before.statusId ? ["toggling"] : []),
    ...(after.description !== before.description
      ? ["altering the description of"]
      : []),
  ].join(", ");

  return ops[0].toUpperCase() + ops.slice(1);
}

export const appToast = {
  messages: (operation: string) =>
    ({
      pending: `${operation} is pending...`,

      success: {
        render({ data }) {
          return data ? (data as string) : `${operation} succeeded!`;
        },
      },

      error: {
        render({ data }) {
          const { message } = data as Error;
          return `${operation} failed${message !== "" ? `: ${message}` : ""}!`;
        },
      },
    } satisfies ToastPromiseParams),

  opsDone,

  theme: () => ({
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  }),

  promise(promise: Promise<unknown>, operation: string) {
    toast.promise(promise, this.messages(operation), this.theme());
  },
};

export function insertAlphabetically<T extends { name?: string }>(
  payload: Draft<T>,
  arr: WritableDraft<T[]>
) {
  const insertAt = arr.findIndex(
    (obj) => obj.name!.toLowerCase() > payload.name!.toLowerCase()
  );

  arr.splice(insertAt > -1 ? insertAt : arr.length, 0, payload);
}

export function sortByName<T extends { name?: string | null }>(a: T, b: T) {
  const lowerA = a.name?.toLowerCase() ?? "";
  const lowerB = b.name?.toLowerCase() ?? "";

  if (lowerA < lowerB) return -1;
  if (lowerA > lowerB) return 1;
  return 0;
}

export type NumericKeys<T> = {
  [P in keyof T]: T[P] extends number ? P : never;
}[keyof T];

export const status = <T extends { statusId?: number }>(
  entity: T,
  setter?: Dispatch<SetStateAction<number>>
) => {
  let int =
    entity.statusId ??
    (process.env.NODE_ENV === "development"
      ? err("calling status without statusId")
      : 0);

  return {
    get active() {
      return (int & 1) === 1;
    },

    set active(value: boolean) {
      int = !value ? int | 1 : int & ~1;

      if (setter) setter(int);
      else entity.statusId = int;
    },

    get admin() {
      return (int & 2) === 2;
    },

    set admin(value: boolean) {
      int = value ? int | (1 << 1) : int & ~(1 << 1);

      if (setter) setter(int);
      else entity.statusId = int;
    },

    toggle(key: "active" | "admin") {
      this[key] = !this[key];

      return int;
    },
  };
};
