const supertest = require("supertest");
const Category = require("./category");

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

test("endpoints work", async () => {
  await api
    .post("/api/categories")
    .send([
      new Category({ category: "asdf" }),
      new Category({ category: "qwer" }),
      new Category({ category: "yxcv" }),
    ])
    .expect(401);
});
