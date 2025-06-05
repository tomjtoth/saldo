import { DateTime } from "luxon";

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

export function err(msg: string) {
  throw new Error(msg);
}

const RE_3_CONSECUTIVE_WORD_CHARS = /\w{3,}/;

export function has3WordChars(val: string) {
  if (!val.match(RE_3_CONSECUTIVE_WORD_CHARS))
    err("must have at least 3 consecutive characters from [0-9a-zA-Z_]");
}

export const toastifyMsgs = (operation: string) => ({
  pending: `${operation}...`,
  success: `${operation} succeeded!`,
  error: `${operation} failed 😭`,
});
