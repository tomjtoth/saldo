import { current, Draft, isDraft, WritableDraft } from "immer";
import { toast, ToastPromiseParams } from "react-toastify";

import { TCategory } from "@/app/_lib/db";
import { virt } from "./virt";

export * from "./datetime";
export * from "./errors";
export * from "./nullEmptyStrings";
export * from "./validators";
export * from "./virt";

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

const RE_CAMEL_TO_SNAKE_CASE = /(?<=\p{Lowercase})(\p{Uppercase})/gu;

export function camelToSnakeCase(camelCase: string) {
  return camelCase.replaceAll(RE_CAMEL_TO_SNAKE_CASE, (uppercase) => {
    return "_" + uppercase.toLowerCase();
  });
}

export async function sleep(ms: number) {
  return new Promise<void>((done) => setTimeout(done, ms));
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

export const deepClone = <T>(obj: T) => {
  try {
    return structuredClone(isDraft(obj) ? current(obj) : obj);
  } catch {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
};

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
