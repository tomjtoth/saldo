const supertest = require("supertest");
const Receipt = require("./receipt");
const { prep3, endpoint } = require("../utils/test_helpers");
const api = supertest(require("../app"));

const DUMMY = {
  paid_on: "2020-01-01",
  paid_by: 0,
};

test("field validations work", async () => {
  expect(() => {
    new Receipt({});
  }).toThrow();

  // the below pass
});

let headers;

describe("via /api/endpoint", () => {
  beforeEach(async () => {
    headers = await prep3(api);
  });

  test("POST new receipt works", async () => {
    const paid_by = 1;
    const DUMMIES = [
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
    ];

    const {
      body: { rcpt, items, item_shares },
    } = await endpoint(api, "/api/receipts", {
      headers,
      send: {
        paid_by,
        items: DUMMIES,
      },
    });

    expect(rcpt.paid_by).toBe(1);
    expect(rcpt.added_by).toBe(1);
    expect(items[2].notes).toBeNull();
    expect(item_shares[0].item_id).toBe(items[0].id);
  });
});
