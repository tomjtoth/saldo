const supertest = require("supertest");
const Category = require("./category");
const { reset_db } = require("../db");
const { register, login } = require("../utils/test_helpers");
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

describe("", () => {
  beforeEach(async () => {
    await reset_db();
    await register(api);
    const res = await login(api);
    headers = { Authorization: `Bearer ${res.body.token}` };
  });

  test("endpoints work", async () => {
    const created_cats = (
      await api
        .post("/api/categories")
        .set(headers)
        .send({
          entities: [
            new Category({ category: "asdf" }),
            new Category({ category: "qwer" }),
            new Category({ category: "yxcv" }),
          ],
        })
        .expect(200)
    ).body;

    expect(created_cats).toHaveLength(3);
  });
});
