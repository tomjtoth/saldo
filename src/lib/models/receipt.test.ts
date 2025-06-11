import { describe, it, expect, beforeEach } from "vitest";

import { addUser } from "../services/user";
import { migrator, Receipt, Revision, User } from ".";
import { VALID_USER_DATA } from "../test_helpers";
import { dateAsInt } from "../utils";

describe("Receipt", () => {
  beforeEach(async () => {
    await migrator.up();
    await Revision.truncate();
    await User.truncate();
    await Receipt.truncate();

    // revId == 1 is created with this function call
    await addUser(VALID_USER_DATA);
  });

  it("can be created", async () => {
    const rcpt = await Receipt.create({
      revId: 1,
      paidBy: 1,
      paidOn: 20200101,
    });

    expect(rcpt).toBeDefined();
  });

  it("can be created w/o paidOn", async () => {
    const rcpt = await Receipt.create({
      revId: 1,
      paidBy: 1,
    });

    const today = dateAsInt().toString();

    expect(rcpt.paidOn).toEqual(
      `${today.slice(0, 4)}-${today.slice(4, 6)}-${today.slice(6)}`
    );
  });
});
