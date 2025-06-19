import { Draft, WritableDraft } from "immer";
import { DateTime } from "luxon";
import { toast, ToastPromiseParams } from "react-toastify";
import { TCategory } from "../models";

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

export function dateAsInt(date?: DateTime): number {
  if (!date) date = DateTime.now();

  return date.year * 10000 + date.month * 100 + date.day;
}

export const LUXON_TZ = {
  zone: "Europe/Helsinki",
};

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

export function err(msg?: string) {
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

  promise: (promise: Promise<unknown>, operation: string) =>
    toast.promise(promise, appToast.messages(operation), appToast.theme()),
};

export function insertAlphabetically<T extends { name: string }>(
  payload: Draft<T>,
  arr: WritableDraft<T[]>
) {
  const insertAt = arr.findIndex(
    (obj) => obj.name.toLowerCase() > payload.name.toLowerCase()
  );

  arr.splice(insertAt > -1 ? insertAt : arr.length, 0, payload);
}
