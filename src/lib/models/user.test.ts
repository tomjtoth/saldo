import { describe, it, expect, beforeEach } from "vitest";
import { v4 as uuid } from "uuid";
import { hashSync } from "bcrypt";

import { createUser, Revision, User } from ".";

const VALID_USER_DATA = {
  name: "user1",
  email: "user1@email.com",
  passwd: hashSync(uuid(), 10),
};

describe("User", () => {
  beforeEach(async () => {
    await Revision.truncate();
    await User.truncate();
  });

  it("can be created with proper attributes", async () => {
    const user = await createUser(VALID_USER_DATA);

    expect(user).not.toBeNull();
  });

  it("cannot be added with non-unique email", async () => {
    await createUser(VALID_USER_DATA);

    await expect(
      async () => await createUser(VALID_USER_DATA)
    ).rejects.toThrow();
  });

  it("cannot be created without necessary fields", async () => {
    const { name, email, passwd } = VALID_USER_DATA;

    await expect(
      async () => await User.create({ name, email })
    ).rejects.toThrow();
    await expect(
      async () => await User.create({ name, passwd })
    ).rejects.toThrow();
    await expect(
      async () => await User.create({ email, passwd })
    ).rejects.toThrow();
  });

  it("cannot be created without proper email address", async () => {
    await expect(
      async () =>
        await User.create({
          name: "user1",
          email: "email1",
          passwd: uuid(),
        })
    ).rejects.toThrow();
  });
});
