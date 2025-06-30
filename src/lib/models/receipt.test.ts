import { describe, it, expect, beforeEach } from "vitest";

import { addUser } from "../services/user";
import { Group, migrator, Receipt, Revision } from ".";
import { VALID_USER_DATA } from "../test_helpers";

describe("Receipt", () => {
  beforeEach(async () => {
    await migrator.up();
    await Revision.truncate();

    // revId == 1 is created with this function call
    await addUser(VALID_USER_DATA);
    await Group.create({ name: "faf" });
  });

  it("can be created", async () => {
    const rcpt = await Receipt.create({
      groupId: 1,
      revId: 1,
      paidBy: 1,
      paidOn: "2020-01-01",
    });

    expect(rcpt).toBeDefined();
  });

  it("can be created w/o paidOn", async () => {
    const rcpt = await Receipt.create({
      groupId: 1,
      revId: 1,
      paidBy: 1,
    });

    expect(rcpt.paidOn).toBeDefined();
  });
});
