import { describe, it, expect } from "vitest";

import { VDate, DATETIME_OPTIONS } from ".";
import { DateTime } from "luxon";

await VDate.initAnchor("2020-01-01");

describe("datetimeFunctions", () => {
  it("convert '2020-01-01' properly to 0", () => {
    const base = VDate.toInt("2020-01-01");
    expect(base).toEqual(0);
  });

  it("convert 0 properly to '2020-01-01'", () => {
    const YYYY_MM_DD = VDate.toStr(0);
    expect(YYYY_MM_DD).toEqual("2020-01-01");
  });

  it("convert '2020-01-02' properly to 24*60*60", () => {
    const jan2 = DateTime.fromFormat("2020-01-02", "y-M-d", DATETIME_OPTIONS);
    const diff = VDate.toInt(jan2);

    expect(diff).toEqual(1 * 24 * 60 * 60);
  });

  it("convert 31*24*60*60 properly to '2020-02-01'", () => {
    const dt = VDate.timeToStr(31 * 24 * 60 * 60);

    expect(dt).toEqual("2020-02-01 00:00:00");
  });
});
