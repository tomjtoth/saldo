const supertest = require("supertest");
const Item = require("./item");
const { prep3, crud_works } = require("../utils/test_helpers");
const { sql } = require("../db");
const api = supertest(require("../app"));

const VALID = {
  id: 0,
  rev_id: 88,
  cost: 499,
  rcpt_id: 2,
  cat_id: 1,
};

const DUMMIES = [
  { ...VALID, cost: 123 },
  { ...VALID, rcpt_id: 22 },
  { ...VALID, cat_id: 23 },
  { ...VALID, xxx: "trimmed away" },
];

test("field validations work", () => {
  expect(() => {
    new Item({ ...VALID, cost: "0" });
  }).toThrow();

  expect(() => {
    new Item({ ...VALID, cost: 4.99 });
  }).toThrow();

  expect(() => {
    new Item({ ...VALID, cost: "   " });
  }).toThrow();

  expect(() => {
    new Item({ ...VALID, notes: 123 });
  }).toThrow();

  expect(() => {
    new Item({ ...VALID, rcpt_id: "123" });
  }).toThrow();

  const validated = new Item({ ...VALID, xxx: 22 });
  expect(validated.id).toBe(0);
  expect(validated.xxx).toBeUndefined();
  expect(validated.notes).toBeNull();
  expect(validated.status_id).toBeUndefined();
});

let headers;

describe("via /api/endpoint", () => {
  beforeEach(async () => {
    headers = await prep3(api);
  });

  test("POST, PUT, DELETE, GET works", async () => {
    await crud_works({
      api,
      route: "/api/items",
      headers,
      initial_payload: DUMMIES,
      modifier: (item) => {
        item.cost *= 2;
        item.notes = `${item.notes} + modded notes`;
        return item;
      },
      modified_checker: ({ cost, notes }, i) => {
        expect(notes).toBe(`${DUMMIES[i].notes} + modded notes`);
        expect(cost).toBe(DUMMIES[i].cost * 2);
      },
    });
  });
});
