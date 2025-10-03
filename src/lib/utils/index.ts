import { Draft, WritableDraft } from "immer";
import { DateTime, DateTimeJSOptions } from "luxon";
import { toast, ToastPromiseParams } from "react-toastify";
import { Dispatch, SetStateAction } from "react";

import { TCategory, TUserChartData } from "@/lib/db";

export function approxFloat(value: number, maxDenominator = 1000) {
  if (value === 0.5) return [1, 2];

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

export class ErrorWithStatus extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message);
    this.status = status;
  }
}

export function err(status: number, message?: string): never;
export function err(message?: string): never;
export function err(intOrStr?: string | number, message?: string): never {
  if (typeof intOrStr === "string") throw new Error(intOrStr);
  if (typeof intOrStr === "number")
    throw new ErrorWithStatus(intOrStr, message);

  throw new Error();
}

const RE_3_CONSECUTIVE_LETTERS = /\p{Letter}{3,}/u;

export function has3ConsecutiveLetters(val: string) {
  if (!val.match(RE_3_CONSECUTIVE_LETTERS))
    err("must have at least 3 consecutive letters");
}

function opsDone<T extends Pick<TCategory, "name" | "description" | "flags">>(
  before: T,
  after: T
) {
  const ops = [
    ...(after.name !== before.name ? ["renaming"] : []),
    ...(virt(after).active !== virt(before).active ? ["toggling"] : []),
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

export type LineType = "solid" | "dashed";

export const chart = (
  style: string | null | Pick<TUserChartData, "chartStyle">
) => {
  const code =
    typeof style === "string"
      ? style
      : typeof style === "object" && style !== null
      ? style.chartStyle
      : "";

  return {
    color: `#${code.slice(1)}`,
  };
};

export const virt = <T extends { flags?: number }>(
  entity: T,
  setter?: Dispatch<SetStateAction<number>>
) => {
  let int =
    entity.flags ??
    (process.env.NODE_ENV === "development"
      ? err("calling status without passing flags")
      : 0);

  const getFlag = (bit: number) => (int & (1 << bit)) !== 0;
  const setFlag = (bit: number, value: boolean) => {
    int = value ? int | (1 << bit) : int & ~(1 << bit);
    finalizeInt();
  };

  const finalizeInt = () => {
    if (setter) setter(int);
    else entity.flags = int;
  };

  return {
    get active() {
      return getFlag(0);
    },

    set active(value: boolean) {
      setFlag(0, value);
    },

    get admin() {
      return getFlag(1);
    },

    set admin(value: boolean) {
      setFlag(1, value);
    },

    toggle(key: "active" | "admin") {
      this[key] = !this[key];

      return int;
    },
  };
};

type ObjectWithUnknownValues = { [key: string]: unknown };
type ObjectWithNulledStrings<T> = {
  [P in keyof T]: T[P] extends string ? string | null : T[P];
};

export function nullEmptyStrings(obj: ObjectWithUnknownValues): void {
  for (const key in obj) {
    const val = obj[key];

    if (val === "") (obj[key] as unknown | null) = null;
  }
}

export function nulledEmptyStrings<T extends ObjectWithUnknownValues>(
  obj: T
): ObjectWithNulledStrings<T> {
  const res = { ...obj };

  nullEmptyStrings(res);

  return res as ObjectWithNulledStrings<T>;
}
