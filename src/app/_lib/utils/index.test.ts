/* eslint-disable @typescript-eslint/no-unused-expressions */
import { describe, it, expect } from "vitest";

import {
  err,
  ErrorWithStatus,
  has3ConsecutiveLetters,
  nullEmptyStrings,
  virt,
} from ".";

describe("status", () => {
  it("resolves ACTIVE state correctly", () => {
    expect(virt({ flags: 0 }).active).to.be.false;
    expect(virt({ flags: 1 }).active).to.be.true;
    expect(virt({ flags: 2 }).active).to.be.false;
    expect(virt({ flags: 3 }).active).to.be.true;
  });

  it("resolves ADMIN state correctly", () => {
    expect(virt({ flags: 0 }).admin).to.be.false;
    expect(virt({ flags: 1 }).admin).to.be.false;
    expect(virt({ flags: 2 }).admin).to.be.true;
    expect(virt({ flags: 3 }).admin).to.be.true;
  });

  it("sets state correctly via setters", () => {
    const obj = { flags: 0 };

    virt(obj).active = true;
    expect(obj.flags).to.equal(1);

    virt(obj).admin = true;
    expect(obj.flags).to.equal(3);

    virt(obj).active = false;
    expect(obj.flags).to.equal(2);

    virt(obj).admin = false;
    expect(obj.flags).to.equal(0);
  });

  it("sets state via toggle + returns flags correctly", () => {
    const obj = { flags: 0 };
    let res: number;

    res = virt(obj).toggle("active");
    expect(res).to.equal(obj.flags).to.equal(1);

    res = virt(obj).toggle("admin");
    expect(res).to.equal(obj.flags).to.equal(3);

    res = virt(obj).toggle("active");
    expect(res).to.equal(obj.flags).to.equal(2);

    res = virt(obj).toggle("admin");
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
