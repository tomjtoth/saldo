import { describe, it, expect, beforeEach } from "vitest";

import { addUser } from "../services/user";
import { Category, migrator, Revision, User } from ".";
import { VALID_USER_DATA } from "../test_helpers";
import { createGroup } from "../services/groups";

describe("Category", () => {
  beforeEach(async () => {
    await migrator.up();
    await Revision.truncate({ cascade: true });
    await User.truncate();
    await Category.truncate();

    // revId == 1 is created with this function call
    const user = await addUser(VALID_USER_DATA);
    await createGroup(user.id, { name: "just you" });
  });

  it("cannot be created without having 3 consecutive letters", async () => {
    await expect(
      async () => await Category.create({ revId: 1, groupId: 1, name: "qq" })
    ).rejects.toThrow();

    await expect(
      async () => await Category.create({ revId: 1, groupId: 1, name: "    " })
    ).rejects.toThrow();

    await expect(
      async () =>
        await Category.create({ revId: 1, groupId: 1, name: " m m m " })
    ).rejects.toThrow();

    await expect(
      async () =>
        await Category.create({ revId: 1, groupId: 1, name: "  mm  " })
    ).rejects.toThrow();
  });

  it("can be created with 3 consecutive letters", async () => {
    expect(
      await Category.create({ revId: 1, groupId: 1, name: "cat" })
    ).toBeDefined();

    expect(
      await Category.create({ revId: 1, groupId: 1, name: "   cat" })
    ).toBeDefined();

    expect(
      await Category.create({ revId: 1, groupId: 1, name: "cat   " })
    ).toBeDefined();

    expect(
      await Category.create({ revId: 1, groupId: 1, name: "   cat   " })
    ).toBeDefined();
  });
});
