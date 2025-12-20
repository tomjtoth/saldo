import { describe, it, expect } from "vitest";

import { vf } from ".";

describe("vf", () => {
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
