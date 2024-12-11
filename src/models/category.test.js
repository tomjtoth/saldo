const supertest = require("supertest");
const Category = require("./category");
const { prep3, crud_works } = require("../utils/test_helpers");
const api = supertest(require("../app"));

const DUMMIES = [
  { category: "category 1" },
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

  test("POST, PUT, DELETE, GET works", async () => {
    await crud_works({
      api,
      route: "/api/categories",
      headers,
      initial_payload: DUMMIES,
      created_checker: (created, id) => {
        expect(created).toStrictEqual({
          ...DUMMIES[id],
          id,
          status_id: 0,
          rev_id: 1,
        });
      },
      modifier: ({ category, ...rest }) => {
        category += " modified";
        return { ...rest, category };
      },
      modified_checker: ({ category }) =>
        expect(category).toMatch(/.+ modified$/),
    });
  });
});
