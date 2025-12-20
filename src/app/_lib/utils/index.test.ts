/* eslint-disable @typescript-eslint/no-unused-expressions */
import { describe, it, expect, vi, Mock, beforeEach, afterEach } from "vitest";

import {
  be,
  err,
  ERROR_MESSAGE_FORMAT,
  ErrorWithStatus,
  is,
  nullEmptyStrings,
  vf,
} from ".";

describe("status", () => {
  it("resolves ACTIVE state correctly", () => {
    expect(vf({ flags: 0 }).active).to.be.false;
    expect(vf({ flags: 1 }).active).to.be.true;
    expect(vf({ flags: 2 }).active).to.be.false;
    expect(vf({ flags: 3 }).active).to.be.true;

    expect(vf.active({ flags: 0 })).to.be.false;
    expect(vf.active({ flags: 1 })).to.be.true;
    expect(vf.active({ flags: 2 })).to.be.false;
    expect(vf.active({ flags: 3 })).to.be.true;
  });

  it("resolves ADMIN state correctly", () => {
    expect(vf({ flags: 0 }).admin).to.be.false;
    expect(vf({ flags: 1 }).admin).to.be.false;
    expect(vf({ flags: 2 }).admin).to.be.true;
    expect(vf({ flags: 3 }).admin).to.be.true;

    expect(vf.admin({ flags: 0 })).to.be.false;
    expect(vf.admin({ flags: 1 })).to.be.false;
    expect(vf.admin({ flags: 2 })).to.be.true;
    expect(vf.admin({ flags: 3 })).to.be.true;
  });

  it("sets state correctly via setters", () => {
    const obj = { flags: 0 };

    vf(obj).active = true;
    expect(obj.flags).to.equal(1);

    vf(obj).admin = true;
    expect(obj.flags).to.equal(3);

    vf(obj).active = false;
    expect(obj.flags).to.equal(2);

    vf(obj).admin = false;
    expect(obj.flags).to.equal(0);
  });

  it("sets state via toggle + returns flags correctly", () => {
    const obj = { flags: 0 };
    let res: number;

    res = vf(obj).toggleActive();
    expect(res).to.equal(obj.flags).to.equal(1);

    res = vf(obj).toggleAdmin();
    expect(res).to.equal(obj.flags).to.equal(3);

    res = vf(obj).toggleActive();
    expect(res).to.equal(obj.flags).to.equal(2);

    res = vf(obj).toggleAdmin();
    expect(res).to.equal(obj.flags).to.equal(0);
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
    const after = nullEmptyStrings(before, { canMutate: false });

    expect(before.c).to.equal("");
    expect(after.c).to.toBeNull();
  });
});

describe("anything that might call err()", () => {
  let stdErr: Mock<{ (...data: unknown[]): void }>;

  beforeEach(() => {
    stdErr = vi.spyOn(console, "error").mockImplementation(() => {
      // silencing prints to stderr
    });
  });

  afterEach(vi.restoreAllMocks);

  describe("validators", () => {
    it("stringWith3ConsecutiveLetters", () => {
      expect(() => be.stringWith3ConsecutiveLetters("as")).to.throw();
      expect(() => be.stringWith3ConsecutiveLetters(" as ")).to.throw();
      expect(() => be.stringWith3ConsecutiveLetters(" as as as ")).to.throw();

      expect(() => be.stringWith3ConsecutiveLetters("asd")).not.to.throw();
      expect(() =>
        be.stringWith3ConsecutiveLetters("ee rr asd")
      ).not.to.throw();
      expect(() =>
        be.stringWith3ConsecutiveLetters(" ff asd ff")
      ).not.to.throw();
    });

    it("number", () => {
      expect(is.number(NaN)).to.eq(false);
      expect(is.number("sdqwe")).to.eq(false);

      expect(is.number(213)).to.eq(true);
      expect(is.number(123.432)).to.eq(true);
      expect(is.number(Number.POSITIVE_INFINITY)).to.eq(true);
      expect(is.number(Number.NEGATIVE_INFINITY)).to.eq(true);
    });

    it("numberOrNull", () => {
      expect(is.numberOrNull(NaN)).to.eq(false);
      expect(is.numberOrNull(undefined)).to.eq(false);
      expect(is.numberOrNull("sdqwe")).to.eq(false);

      expect(is.numberOrNull(213)).to.eq(true);
      expect(is.numberOrNull(123.432)).to.eq(true);
      expect(is.numberOrNull(Number.POSITIVE_INFINITY)).to.eq(true);
      expect(is.numberOrNull(Number.NEGATIVE_INFINITY)).to.eq(true);
    });
  });

  describe("fn err()", () => {
    it("throws ErrorWithStatus with correct status and message", () => {
      try {
        err(404, { message: "Not Found" });
      } catch (e) {
        expect(stdErr).toHaveBeenCalledWith(ERROR_MESSAGE_FORMAT, "Not Found");
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

    it("prints 'access denied' and the passed opts to stderr", () => {
      const errOpts = {
        info: "faaf",
        args: { foo: "bar", life: 42 },
      };

      try {
        err(errOpts);
      } catch {
        expect(stdErr).toHaveBeenCalledWith(
          ERROR_MESSAGE_FORMAT,
          "access denied"
        );

        expect(stdErr).toHaveBeenCalledWith(errOpts);
      }
    });
  });
});
