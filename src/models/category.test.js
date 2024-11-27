const supertest = require("supertest");
const Category = require("./category");
const { prep3, endpoint } = require("../utils/test_helpers");
const api = supertest(require("../app"));

const DUMMIES = [
  { category: "category 1", unread_key: 1243 },
  { category: "category 2" },
  { category: "category 3" },
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
  });

  test("POST, PUT, DELETE works", async () => {
    const { body: created } = await endpoint(api, "/api/categories", {
      send: DUMMIES,
      method: "post",
      headers,
      code: 201,
    });

    expect(created).toHaveLength(3);

    const { body: modified } = await endpoint(api, "/api/categories", {
      send: created.map((cat) => {
        cat.category += " modified";
        return cat;
      }),
      method: "put",
      headers,
      code: 201,
    });

    modified.forEach(({ category }) =>
      expect(category).toMatch(/.+ modified$/)
    );
  });
});
