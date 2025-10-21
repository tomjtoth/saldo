import { DateTime as LuxonDateTime, DateTimeJSOptions } from "luxon";

import { err } from "../errors";

export const DATETIME_OPTIONS: DateTimeJSOptions = {
  zone: process.env.TIMEZONE ?? "Europe/Helsinki",
};

const DATETIME_FORMAT = process.env.DATETIME_FORMAT ?? "yyyy-MM-dd HH:mm:ss";
const DATE_FORMAT = process.env.DATE_FORMAT ?? "yyyy-MM-dd";
const DAY = 24 * 60 * 60;

abstract class AnchorMethods {
  static get anchor() {
    return (global ?? window).__SALDO_DATETIME_ANCHOR__;
  }

  static async initAnchor(anchor?: string) {
    if (!anchor) {
      const { sql } = await import("drizzle-orm");
      const { db } = await import("../../db");

      const res: { payload: string } = await db.get(sql`
        SELECT payload FROM metadata WHERE "name" = 'datetime anchor'
      `);

      anchor = res.payload;
    }

    (global ?? window).__SALDO_DATETIME_ANCHOR__ = LuxonDateTime.fromFormat(
      anchor,
      DATE_FORMAT,
      DATETIME_OPTIONS
    ).toMillis();
  }
}

abstract class TimeMethods extends AnchorMethods {
  static timeToInt(val?: LuxonDateTime | string, fmt = DATETIME_FORMAT) {
    const notParsableFromStr =
      typeof val === "string" &&
      ![fmt, "y.M.d. H:m:s"].some((fmt) => {
        const parsed = LuxonDateTime.fromFormat(
          val as string,
          fmt,
          DATETIME_OPTIONS
        );
        if (parsed.isValid) {
          val = parsed;
          return true;
        }
      });

    if (notParsableFromStr) err("unparsable DateTime string");

    const millis = (
      (val as LuxonDateTime) ?? LuxonDateTime.local(DATETIME_OPTIONS)
    ).toMillis();

    return Math.round((millis - this.anchor) / 1000);
  }

  static timeToStr(val?: number, fmt = DATETIME_FORMAT) {
    const asDate =
      typeof val === "number"
        ? LuxonDateTime.fromMillis(val * 1000 + this.anchor, DATETIME_OPTIONS)
        : LuxonDateTime.local(DATETIME_OPTIONS);

    return asDate.toFormat(fmt);
  }
}

export abstract class VDate extends TimeMethods {
  static toInt(val?: LuxonDateTime | string) {
    return this.timeToInt(val, DATE_FORMAT);
  }

  static toStr(val?: number) {
    if (val) val *= DAY;
    return this.timeToStr(val, DATE_FORMAT);
  }

  static asISO() {
    return LuxonDateTime.local(DATETIME_OPTIONS).toISODate();
  }

  static couldBeParsedFrom(val: string) {
    return LuxonDateTime.fromFormat(val, DATE_FORMAT, DATETIME_OPTIONS).isValid;
  }
}
