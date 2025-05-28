import { describe, it, expect, beforeEach } from "vitest";

import { Revision, User } from ".";
import { VALID_USER_DATA } from "../test_helpers";

describe("User", () => {
  beforeEach(async () => {
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
