import { DateTime, DateTimeJSOptions } from "luxon";
import { err } from "./errors";

export const EUROPE_HELSINKI = {
  zone: "Europe/Helsinki",
} satisfies DateTimeJSOptions;

const DT_FORMAT = "yyyy-MM-dd HH:mm:ss";

// TODO: store this in the DB for consistency with the data

// 2|datetime||{"anchor":"2020-01-01","format":"yyyy-MM-dd HH:mm:ss","timezone":"Europe/Helsinki"}
const DT_ANCHOR = DateTime.fromFormat(
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

export function todayAsISO() {
  return DateTime.local(EUROPE_HELSINKI).toISODate();
}

export function isValidDateString(val: string) {
  return DateTime.fromFormat(val, "y-M-d", EUROPE_HELSINKI).isValid;
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
  ) {
    err("unparsable DateTime string");
  }

  const millis = (
    (val as DateTime) ?? DateTime.local(EUROPE_HELSINKI)
  ).toMillis();
  return Math.round((millis - DT_ANCHOR) / 1000);
}
