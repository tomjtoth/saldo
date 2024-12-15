const supertest = require("supertest");
const Category = require("./category");
const { prep3, crud_works } = require("../utils/test_helpers");
const api = supertest(require("../app"));

const DUMMIES = [
  { category: "category 1" },
  { category: "category 2" },
  { category: "category 3" },
];

// TODO: remove when publishing

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
      dummy: DUMMIES[0],
      modifier: ({ category, ...rest }) => {
        category += " modified";
        return { ...rest, category };
      },
      comp_modified: (created, modified) => {
        const { category, ...rest } = created;
        expect(modified).toStrictEqual({
          ...rest,
          category: `${category} modified`,
          rev_id: 2,
        });
      },
    });
  });
});
