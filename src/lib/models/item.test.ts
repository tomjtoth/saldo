import { describe, it, expect, beforeEach } from "vitest";

import { addUser } from "../services/user";
import { VALID_USER_DATA } from "../testHelpers";

describe("Item", () => {
  beforeEach(async () => {
    await migrator.up();
    await Revision.truncate();

    // revId == 1 is created with this function call
    await addUser(VALID_USER_DATA);

    await User.create({
      name: "user2",
      email: "user2@gmail.com",
      revId: 1,
    });

    await Category.bulkCreate([
      { revId: 1, description: "cat1" },
      { revId: 1, description: "cat2" },
    ]);

    await Receipt.bulkCreate([
      { revId: 1, paidBy: 1 },
      { revId: 1, paidBy: 2 },
    ]);
  });

  it("can be created one at a time", async () => {
    const item = await Item.create({
      revId: 1,
      rcptId: 1,
      catId: 1,

      cost: 499,
      notes: "qwer",
    });

    expect(item.id).toEqual(1);
    expect(item.notes).toEqual("qwer");
  });

  it("can be created in bulk", async () => {
    const items = await Item.bulkCreate(
      [
        [1, 1, 199],
        [1, 1, 299],
        [1, 2, 399],
        [2, 1, 499],
        [2, 2, 599],
        [2, 2, 699],
      ].map(([rcptId, catId, cost]) => ({
        revId: 1,
        rcptId,
        catId,
        cost,
      }))
    );

    expect(items[0].id).toEqual(1);
    expect(items.at(-1)!.id).toEqual(6);
  });
});
