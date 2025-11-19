import { current, Draft, isDraft, WritableDraft } from "immer";
import { toast, ToastPromiseParams } from "react-toastify";

import { Category } from "@/app/categories/_lib";
import { virt } from "./virt";

export * from "./datetime";
export * from "./errors";
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

export const deepClone = <T>(obj: T) => {
  try {
    return structuredClone(isDraft(obj) ? current(obj) : obj);
  } catch {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
};

/**
 * mutates by default
 */
export function nullEmptyStrings<E extends { [key: string]: unknown }>(
  entity: E,
  opts?: { canMutate?: false }
): E {
  const obj = opts?.canMutate ?? true ? entity : deepClone(entity);

  for (const key in obj) {
    const val = obj[key];

    if (val === "") (obj[key] as string | null) = null;
  }

  return obj;
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

  opsDone<T extends Pick<Category, "name" | "description" | "flags">>(
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
  },

  theme: () => ({
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
  }),

  promise(promise: Promise<unknown>, operation: string) {
    return toast.promise(promise, this.messages(operation), this.theme());
  },

  error(err: unknown) {
    return toast.error((err as Error).message as string, this.theme());
  },
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

export function sortByName<T extends { name: string | null }>(a: T, b: T) {
  const lowerA = a.name?.toLowerCase() ?? "";
  const lowerB = b.name?.toLowerCase() ?? "";

  return lowerA < lowerB ? -1 : lowerA > lowerB ? 1 : 0;
}
