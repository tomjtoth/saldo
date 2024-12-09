const supertest = require("supertest");
const Category = require("./category");
const { prep3, crud_works } = require("../utils/test_helpers");
const { sql } = require("../db");
const api = supertest(require("../app"));

const DUMMIES = [
  { id: 10, rev_id: 0, category: "category 1" },
  { id: 11, rev_id: 0, category: "category 2" },
  { id: 12, rev_id: 0, category: "category 3" },
];

test("field validations work", async () => {
  expect(() => {
    new Category({});
  }).toThrow();

  expect(() => {
    new Category({ category: "AA" });
  }).toThrow();

  expect(() => {
    new Category({ category: "AA bb xc dd ff" });
  }).toThrow();

  expect(() => {
    new Category({ category: "A A" });
  }).toThrow();

  expect(() => {
    new Category({ category: 12312312 });
  }).toThrow();

  expect(() => {
    new Category({ category: [12312312] });
  }).toThrow();

  // the below pass
  DUMMIES.forEach((obj) => new Category(obj));
});

let headers;

describe("via /api/endpoint", () => {
  beforeEach(async () => {
    headers = await prep3(api);

    await sql`insert into revisions ${sql([{ id: 1, rev_by: 0 }])}`;
  });

  test("POST, PUT, DELETE, GET works", () => {
    crud_works({
      api,
      route: "/api/categories",
      headers,
      initial_payload: DUMMIES,
      modifier: (cat) => {
        cat.category += " modified";
        return cat;
      },
      modified_checker: ({ category }) =>
        expect(category).toMatch(/.+ modified$/),
    });
  });
});
