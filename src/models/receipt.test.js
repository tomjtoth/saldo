const { v4: uuid } = require("uuid");
const supertest = require("supertest");
const { sql } = require("../db");
const Receipt = require("./receipt");
const { prep3, endpoint } = require("../utils/test_helpers");
const api = supertest(require("../app"));

jest.setTimeout(60 * 60 * 1000);

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
    await sql`insert into categories ${sql([
      { id: 3, category: "qwerr 3", rev_id: 0 },
      { id: 4, category: "qwerr 4", rev_id: 0 },
      { id: 5, category: "qwerr 5", rev_id: 0 },
    ])}`;

    await sql`insert into users ${sql([
      { id: 1, name: "dummy2", email: "qq@ww.cc", passwd: uuid() },
      { id: 2, name: "dummy3", email: "qq2@ww.cc", passwd: uuid() },
    ])}`;

    const paid_on = "2020-01-01";
    const paid_by = 1;

    const {
      body: { receipt, items, item_shares },
    } = await endpoint(api, "/api/receipts", {
      headers,
      send: {
        paid_on: new Date(paid_on).to_epoch_date(),
        paid_by,
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
    });

    expect(receipt).toStrictEqual({
      id: 0,
      rev_id: 1,
      status_id: 0,
      paid_on,
      paid_by,
    });
    expect(items).toStrictEqual([
      {
        id: 0,
        rev_id: 1,
        status_id: 0,
        rcpt_id: 0,
        cat_id: 3,
        cost: 100,
        notes: "for user 2",
      },
      {
        id: 1,
        rev_id: 1,
        status_id: 0,
        rcpt_id: 0,
        cat_id: 3,
        cost: 200,
        notes: "for users 0 & 2, but not user 1",
      },
      {
        id: 2,
        rev_id: 1,
        status_id: 0,
        rcpt_id: 0,
        cat_id: 4,
        cost: 300,
        notes: null,
      },
      {
        id: 3,
        rev_id: 1,
        status_id: 0,
        rcpt_id: 0,
        cat_id: 5,
        cost: 400,
        notes: "for user 0",
      },
    ]);
    expect(item_shares).toStrictEqual([
      {
        item_id: 0,
        user_id: 2,
        status_id: 0,
        rev_id: 1,
        share: 1,
      },
      {
        item_id: 1,
        user_id: 0,
        status_id: 0,
        rev_id: 1,
        share: 1,
      },
      {
        item_id: 1,
        user_id: 2,
        status_id: 0,
        rev_id: 1,
        share: 1,
      },
      {
        item_id: 3,
        user_id: 0,
        status_id: 0,
        rev_id: 1,
        share: 1,
      },
    ]);
  });
});
