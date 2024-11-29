const supertest = require("supertest");
const Item = require("./item");
const { prep3, crud_works } = require("../utils/test_helpers");
const api = supertest(require("../app"));

const DUMMY = { cost: 499, rcpt_id: 1, cat_id: 1, notes: "asdf" };

const DUMMIES = [
  { ...DUMMY, cost: 123 },
  { ...DUMMY, rcpt_id: 22 },
  { ...DUMMY, cat_id: 23 },
  { ...DUMMY, notes: null },
];

test("field validations work", () => {
  expect(() => {
    new Item({ ...DUMMY, cost: "0" });
  }).toThrow();

  expect(() => {
    new Item({ ...DUMMY, cost: 4.99 });
  }).toThrow();

  expect(() => {
    new Item({ ...DUMMY, cost: "   " });
  }).toThrow();

  expect(() => {
    new Item({ ...DUMMY, notes: 123 });
  }).toThrow();

  expect(() => {
    new Item({ ...DUMMY, rcpt_id: "123" });
  }).toThrow();

  const item = new Item({ cost: 1234, cat_id: 11, rcpt_id: 33 });
  expect(item.id).toBeUndefined();
  expect(item.rev_id).toBeUndefined();
  expect(item.notes).toBeNull();
  expect(item.status_id).toBe(0);
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
