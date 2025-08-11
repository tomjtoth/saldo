import { describe, it, expect, beforeEach } from "vitest";

import { migrator, Revision, User } from ".";
import { VALID_USER_DATA } from "../testHelpers";

describe("User", () => {
  beforeEach(async () => {
    await migrator.up();
    await Revision.truncate({ cascade: true });
    await User.truncate();
  });

  it("can be created with proper attributes", async () => {
    const user = await User.create(VALID_USER_DATA);

    expect(user).not.toBeNull();
    expect(user.id).toEqual(1);
  });

  it("cannot be added with non-unique email", async () => {
    await User.create(VALID_USER_DATA);

    await expect(
      async () => await User.create(VALID_USER_DATA)
    ).rejects.toThrow();
  });

  it("cannot be created with name.length < 3", async () => {
    await expect(
      async () => await User.create({ ...VALID_USER_DATA, name: "qq" })
    ).rejects.toThrow();
  });

  it("cannot be created without proper email address", async () => {
    await expect(
      async () =>
        await User.create({
          ...VALID_USER_DATA,
          email: "email1",
        })
    ).rejects.toThrow();
  });
});
