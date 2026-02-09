import { DateTime, DateTimeJSOptions } from "luxon";

import { err } from "../errors";

export const DATETIME_OPTIONS: DateTimeJSOptions = {
  zone: process.env.TIMEZONE ?? "Europe/Helsinki",
};

const DAY = 24 * 60 * 60;
const ISO_DATE_FMT = "yyyy-MM-dd";
const DATETIME_FORMAT =
  process.env.DATETIME_FORMAT ?? `${ISO_DATE_FMT} HH:mm:ss`;
const DATE_FORMAT = process.env.DATE_FORMAT ?? ISO_DATE_FMT;

abstract class AnchorMethods {
  static get anchor() {
    return (global ?? window).__SALDO_DATETIME_ANCHOR__;
  }

  static async initAnchor(anchor?: string) {
    if (!anchor) {
      const { sql } = await import("drizzle-orm");
      const { db } = await import("../../db/instance");

      const res: { payload: string } = await db.get(sql`
        SELECT payload FROM metadata WHERE "name" = 'datetime anchor'
      `);

      anchor = res.payload;
    }

    (global ?? window).__SALDO_DATETIME_ANCHOR__ = DateTime.fromFormat(
      anchor,
      DATE_FORMAT,
      DATETIME_OPTIONS
    ).toMillis();
  }
}

abstract class TimeMethods extends AnchorMethods {
  static timeToInt(val?: DateTime | string, fmt = DATETIME_FORMAT) {
    const notParsableFromStr =
      typeof val === "string" &&
      ![fmt, "y.M.d. H:m:s"].some((fmt) => {
        const parsed = DateTime.fromFormat(
          val as string,
          fmt,
          DATETIME_OPTIONS
        );
        if (parsed.isValid) {
          val = parsed;
          return true;
        }
      });

    if (notParsableFromStr)
      err("unparsable DateTime string", { args: { val } });

    const millis = (
      (val as DateTime) ?? DateTime.local(DATETIME_OPTIONS)
    ).toMillis();

    return Math.round((millis - this.anchor) / 1000);
  }

  static timeToStr(val?: number | DateTime, fmt = DATETIME_FORMAT) {
    const asDate =
      val !== undefined && val instanceof DateTime
        ? val
        : typeof val === "number"
        ? DateTime.fromMillis(val * 1000 + this.anchor, DATETIME_OPTIONS)
        : DateTime.local(DATETIME_OPTIONS);

    return asDate.toFormat(fmt);
  }
}

export abstract class VDate extends TimeMethods {
  static toInt(val?: DateTime | string) {
    const asTime = this.timeToInt(val, DATE_FORMAT);
    return Math.ceil(asTime / DAY);
  }

  static toStr(val?: number | DateTime, fmt = DATE_FORMAT) {
    if (typeof val === "number") val *= DAY;
    return this.timeToStr(val, fmt);
  }

  static toStrISO(val?: number | DateTime) {
    return this.toStr(val, ISO_DATE_FMT);
  }

  static nMonthsAgo(months: number) {
    const date = DateTime.local(DATETIME_OPTIONS)
      .minus({ months })
      .set({ day: 1 });

    return this.toStr(date);
  }

  static couldBeParsedFrom(val: string) {
    return DateTime.fromFormat(val, DATE_FORMAT, DATETIME_OPTIONS).isValid;
  }
}
