import { describe, it, expect } from "vitest";

import {
  dateFromInt,
  datetimeFromInt,
  datetimeToInt,
  dateToInt,
  err,
  ErrorWithStatus,
  EUROPE_HELSINKI,
  has3ConsecutiveLetters,
  nulledEmptyStrings,
  nullEmptyStrings,
  status,
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

describe("status", () => {
  it("resolves ACTIVE state correctly", () => {
    expect(status({ statusId: 0 }).active).to.be.false;
    expect(status({ statusId: 1 }).active).to.be.true;
    expect(status({ statusId: 2 }).active).to.be.false;
    expect(status({ statusId: 3 }).active).to.be.true;
  });

  it("resolves ADMIN state correctly", () => {
    expect(status({ statusId: 0 }).admin).to.be.false;
    expect(status({ statusId: 1 }).admin).to.be.false;
    expect(status({ statusId: 2 }).admin).to.be.true;
    expect(status({ statusId: 3 }).admin).to.be.true;
  });

  it("sets state correctly via setters", () => {
    const obj = { statusId: 0 };

    status(obj).active = true;
    expect(obj.statusId).to.equal(1);

    status(obj).admin = true;
    expect(obj.statusId).to.equal(3);

    status(obj).active = false;
    expect(obj.statusId).to.equal(2);

    status(obj).admin = false;
    expect(obj.statusId).to.equal(0);
  });

  it("sets state via toggle + returns statusId correctly", () => {
    const obj = { statusId: 0 };
    let res: number;

    res = status(obj).toggle("active");
    expect(res).to.equal(obj.statusId).to.equal(1);

    res = status(obj).toggle("admin");
    expect(res).to.equal(obj.statusId).to.equal(3);

    res = status(obj).toggle("active");
    expect(res).to.equal(obj.statusId).to.equal(2);

    res = status(obj).toggle("admin");
    expect(res).to.equal(obj.statusId).to.equal(0);
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

describe("has3ConsecutiveLetters", () => {
  it("does not mutate the original", () => {
    expect(() => has3ConsecutiveLetters("as")).to.throw();
    expect(() => has3ConsecutiveLetters(" as ")).to.throw();
    expect(() => has3ConsecutiveLetters(" as as as ")).to.throw();

    expect(() => has3ConsecutiveLetters("asd")).not.to.throw();
  });
});

describe("fn err()", () => {
  it("throws ErrorWithStatus with correct status and message", () => {
    try {
      err(404, "Not Found");
    } catch (e) {
      expect(e).to.be.instanceOf(ErrorWithStatus);
      const ew = e as ErrorWithStatus;
      expect(ew.status).to.equal(404);
      expect(ew.message).to.equal("Not Found");
    }
  });

  it("throws plain Error when called with string", () => {
    try {
      err("Oops");
    } catch (e) {
      expect(e).to.be.instanceOf(Error);
      expect(e).not.to.be.instanceOf(ErrorWithStatus);
      expect((e as Error).message).to.equal("Oops");
    }
  });

  it("throws plain Error when called without args", () => {
    try {
      err();
    } catch (e) {
      expect(e).to.be.instanceOf(Error);
      expect((e as Error).message).to.equal("");
    }
  });
});
