import { describe, it, expect } from "vitest";

import {
  dateFromInt,
  datetimeFromInt,
  datetimeToInt,
  dateToInt,
  LUXON_TZ,
} from ".";
import { DateTime } from "luxon";

describe("datetimeFunctions", () => {
  it("convert '2020-01-01' properly to 0", () => {
    const base = dateToInt("2020-01-01");
    expect(base).toEqual(0);
  });

  //     datetimeToInt
  // datetimeFromInt
  it("convert 0 properly to '2020-01-01'", () => {
    const YYYY_MM_DD = dateFromInt(0);
    expect(YYYY_MM_DD).toEqual("2020-01-01");
  });

  it("convert '2020-01-02' properly to 24*60*60", () => {
    const jan2 = DateTime.fromFormat("2020-01-02", "y-M-d", LUXON_TZ);
    const diff = datetimeToInt(jan2);

    expect(diff).toEqual(1 * 24 * 60 * 60);
  });

  it("convert 31*24*60*60 properly to '2020-02-01'", () => {
    const dt = datetimeFromInt(31 * 24 * 60 * 60);

    expect(dt).toEqual("2020-02-01T00:00:00.000+02:00");
  });
});
