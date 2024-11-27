const { body_validator } = require("./middleware");

describe("body_validator", () => {
  test("POST users works", async () => {
    const unhashed_pw = "qwerasdf";
    const req = {
      params: { tbl: "users" },
      method: "POST",
      // registering does not require active login
      user: null,
      body: [{ name: "asdf", passwd: unhashed_pw, email: "a@b.cd" }],
    };

    const res = jest.fn();
    const next = jest.fn();

    await body_validator(req, res, next);

    expect(req.body.entities[0].passwd).not.toBe(unhashed_pw);
  });

  test("POST receipts", async () => {
    const req = {
      params: { tbl: "receipts" },
      method: "POST",
      user: { id: 0 },
      body: {
        items: [
          {
            cat_id: 3,
            cost: 100,
            notes: "for user 2",
            shares: [null, null, 1],
          },
          {
            cat_id: 3,
            cost: 200,
            notes: "for users 0 & 2, but not user 1",
            shares: [1, null, 1],
          },
          {
            cat_id: 4,
            cost: 300,
          },
          {
            cat_id: 5,
            cost: 400,
            notes: "for user 0",
            shares: [1],
          },
        ],
      },
    };

    const res = jest.fn();
    const next = jest.fn();

    await body_validator(req, res, next);

    // user password should be hashed
    expect(req.body);
  });
});
