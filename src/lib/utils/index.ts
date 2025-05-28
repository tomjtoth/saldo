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
