const supertest = require("supertest");
const { sql } = require("../db");
const Item = require("./item");
const { prep3, crud } = require("../utils/test_helpers");

const api = supertest(require("../app"));

// TODO: remove when publishing

const VALID = {
  id: 0,
  rev_id: 1,
  cost: 499,
  rcpt_id: 0,
  cat_id: 0,
  discarded: "this gets discarded",
};

const DUMMIES = [
  { ...VALID, cost: 123 },
  { ...VALID, rcpt_id: 22 },
  { ...VALID, cat_id: 0 },
];

test("field validations work", () => {
  // postgres returns ints as string,
  // which was compensated for in parsing numeric strings as numbers,
  // if the model requires so
  // expect(() => {
  //   new Item({ ...VALID, cost: "0" });
  // }).toThrow();

  expect(() => {
    new Item({ ...VALID, cost: 4.99 });
  }).toThrow();

  // expect(() => {
  //   const x = new Item({ ...VALID, cost: "   " });
  //   return x;
  // }).toThrow();

  expect(() => {
    new Item({ ...VALID, notes: 123 });
  }).toThrow();

  // expect(() => {
  //   new Item({ ...VALID, rcpt_id: "123" });
  // }).toThrow();

  DUMMIES.forEach((dummy) => new Item(dummy));
  const validated = new Item({ ...VALID, discarded: 22 });
  expect(validated.id).toBe(0);
  expect(validated.discarded).toBeUndefined();
  expect(validated.notes).toBeNull();
  expect(validated.status_id).toBeUndefined();
});

let headers;

describe("via /api/endpoint", () => {
  beforeEach(async () => {
    headers = await prep3(api);

    await sql.begin((sql) => [
      sql`insert into categories ${sql([
        { id: 0, rev_id: 0, category: "test1" },
      ])}`,

      sql`insert into receipts ${sql([
        {
          id: 0,
          rev_id: 0,
          paid_on: new Date("2020-01-01").to_epoch_date(),
          paid_by: 0,
        },
      ])}`,
    ]);
  });

  test("POST, PUT, DELETE, GET works", async () => {
    await crud({
      api,
      route: "/api/items",
      headers,
      dummy: VALID,
      comp_created: (dummy, created) => {
        const { discarded, ...rest } = dummy;
        expect(created).toStrictEqual({
          ...rest,
          notes: null,
          id: 0,
          rev_id: 1,
          status_id: 0,
        });
      },
      modifier: ({ cost, notes, ...item }) => {
        cost *= 2;
        notes = "modded notes";
        return { ...item, cost, notes };
      },
      comp_modified: (created, { cost, notes }) => {
        expect(notes).toBe("modded notes");
        expect(cost).toBe(created.cost * 2);
      },
    });
  });
});
