const supertest = require("supertest");
const Category = require("./category");
const { prep3 } = require("../utils/test_helpers");
const api = supertest(require("../app"));

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
  new Category({ category: "cat" });
  new Category({ category: "dog 1 x , . _ /" });
  new Category({ category: " 1 x , .cow_ /" });
});

let headers;

describe("via /api/endpoint", () => {
  beforeEach(async () => {
    headers = await prep3(api);
  });

  test("can create", async () => {
    const created = (
      await api
        .post("/api/categories")
        .set(headers)
        .send([
          { category: "asdf" },
          { category: "qwer" },
          { category: "yxcv" },
        ])
        .expect(200)
        .expect("Content-Type", /application\/json/)
    ).body;

    expect(created).toHaveLength(3);
  });
});
