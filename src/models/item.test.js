const supertest = require("supertest");
const { sql } = require("../db");
const Item = require("./item");
const { prep3, crud_works } = require("../utils/test_helpers");

const api = supertest(require("../app"));

const VALID = {
  id: 0,
  rev_id: 1,
  cost: 499,
  rcpt_id: 0,
  cat_id: 0,
};

const DUMMIES = [
  { ...VALID, cost: 123 },
  { ...VALID, rcpt_id: 22 },
  { ...VALID, cat_id: 0 },
  { ...VALID, discarded: "this gets discarded" },
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
      sql`insert into id.categories ${sql([{ id: 0 }, { id: 1 }])}`,
      sql`insert into categories ${sql([
        { id: 0, rev_id: 0, category: "test1" },
        { id: 1, rev_id: 0, category: "test2" },
      ])}`,

      sql`insert into id.receipts ${sql([{ id: 0 }, { id: 22 }])}`,
      sql`insert into receipts ${sql([
        { id: 0, rev_id: 0, paid_on: "2020-01-01", paid_by: 0 },
        { id: 22, rev_id: 0, paid_on: "2022-02-02", paid_by: 0 },
      ])}`,
    ]);
  });

  test("POST, PUT, DELETE, GET works", async () => {
    await crud_works({
      api,
      route: "/api/items",
      headers,
      dummies: DUMMIES,
      created_checker: (created, id) => {
        const { notes = null, discarded, ...item } = DUMMIES[id];
        expect(created).toStrictEqual({
          ...item,
          notes,
          id,
          status_id: 0,
          rev_id: 1,
        });
      },
      modifier: ({ cost, notes, ...item }, idx) => {
        cost *= 2;
        notes = `${idx} + modded notes`;
        return { ...item, cost, notes };
      },
      modified_checker: ({ cost, notes }, i) => {
        expect(notes).toBe(`${i} + modded notes`);
        expect(cost).toBe(DUMMIES[i].cost * 2);
      },
    });
  });
});
