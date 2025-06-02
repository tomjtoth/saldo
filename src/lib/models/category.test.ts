import { describe, it, expect, beforeEach } from "vitest";

import { addUser } from "../services/user";
import { Category, migrator, Revision, User } from ".";
import { VALID_USER_DATA } from "../test_helpers";

describe("Category", () => {
  beforeEach(async () => {
    await migrator.up();
    await Revision.truncate({ cascade: true });
    await User.truncate();
    await Category.truncate();

    // revId == 1 is created with this function call
    await addUser(VALID_USER_DATA);
  });

  it("cannot be created without having \\w{3,}", async () => {
    await expect(
      async () => await Category.create({ revId: 1, description: "qq" })
    ).rejects.toThrow();

    await expect(
      async () => await Category.create({ revId: 1, description: "    " })
    ).rejects.toThrow();

    await expect(
      async () => await Category.create({ revId: 1, description: " m m m " })
    ).rejects.toThrow();

    await expect(
      async () => await Category.create({ revId: 1, description: "  mm  " })
    ).rejects.toThrow();
  });

  it("can be created with \\w{3,}", async () => {
    expect(
      await Category.create({ revId: 1, description: "cat" })
    ).toBeDefined();

    expect(
      await Category.create({ revId: 1, description: "   cat" })
    ).toBeDefined();

    expect(
      await Category.create({ revId: 1, description: "cat   " })
    ).toBeDefined();

    expect(
      await Category.create({ revId: 1, description: "   cat   " })
    ).toBeDefined();
  });
});
