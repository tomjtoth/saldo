import { describe, it, expect, beforeEach } from "vitest";

import { migrator, Revision, User } from "../models";
import { addUser } from "./user";
import { VALID_USER_DATA } from "../test_helpers";

describe("addUser", () => {
  beforeEach(async () => {
    await migrator.up();
    await Revision.truncate();
    await User.truncate();
  });

  it("works with proper attributes", async () => {
    await addUser(VALID_USER_DATA);
    const users = await User.findAll({});
    const revisions = await Revision.findAll({});

    expect(users).to.have.length(1);
    expect(revisions).to.have.length(1);

    expect(users[0].revId).toEqual(1);
    expect(revisions[0].revBy).toEqual(1);
  });
});
