import { describe, it, expect } from "vitest";

import {
  dateFromInt,
  datetimeFromInt,
  datetimeToInt,
  dateToInt,
  EUROPE_HELSINKI,
  nulledEmptyStrings,
  nullEmptyStrings,
} from ".";
import { DateTime } from "luxon";

describe("datetimeFunctions", () => {
  it("convert '2020-01-01' properly to 0", () => {
    const base = dateToInt("2020-01-01");
    expect(base).toEqual(0);
  });

  it("convert 0 properly to '2020-01-01'", () => {
    const YYYY_MM_DD = dateFromInt(0);
    expect(YYYY_MM_DD).toEqual("2020-01-01");
  });

  it("convert '2020-01-02' properly to 24*60*60", () => {
    const jan2 = DateTime.fromFormat("2020-01-02", "y-M-d", EUROPE_HELSINKI);
    const diff = datetimeToInt(jan2);

    expect(diff).toEqual(1 * 24 * 60 * 60);
  });

  it("convert 31*24*60*60 properly to '2020-02-01'", () => {
    const dt = datetimeFromInt(31 * 24 * 60 * 60);

    expect(dt).toEqual("2020-02-01 00:00:00");
  });
});

describe("nullEmptyStrings", () => {
  it("changes only empty strings", () => {
    const before = { a: 1, b: "2", c: "", d: null, e: undefined };
    const after = { ...before };
    nullEmptyStrings(after);

    expect(after).to.deep.equal({
      a: 1,
      b: "2",
      c: null,
      d: null,
      e: undefined,
    });
  });
});

describe("nulledEmptyStrings", () => {
  it("does not mutate the original", () => {
    const before = { a: 1, b: "2", c: "", d: null, e: undefined };
    const after = nulledEmptyStrings(before);

    expect(before.c).to.equal("");
    expect(after.c).to.toBeNull();
  });
});
