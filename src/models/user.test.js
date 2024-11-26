const supertest = require("supertest");
const User = require("./user");
const { prep3, register, login, DUMMY_USER } = require("../utils/test_helpers");
const api = supertest(require("../app"));

test("field validations work", async () => {
  expect(() => {
    new User({});
  }).toThrow();

  expect(() => {
    new User({ ...DUMMY_USER, name: undefined });
  }).toThrow();

  expect(() => {
    new User({ ...DUMMY_USER, name: "ss" });
  }).toThrow();

  expect(() => {
    new User({ ...DUMMY_USER, email: undefined });
  }).toThrow();

  expect(() => {
    new User({ ...DUMMY_USER, email: "sssssss" });
  }).toThrow();

  // expect(() => {
  //   new User({ ...DUMMY_USER, passwd: "qwer" });
  // }).toThrow();

  // the below pass
  new User(DUMMY_USER);
  new User({ ...DUMMY_USER, name: "qwe" });
  new User({ ...DUMMY_USER, email: "a@b.cd" });
  new User({ ...DUMMY_USER, passwd: "        " });
});

let headers;

describe("/api/endpoint", () => {
  beforeEach(async () => {
    headers = await prep3(api);
  });

  test("can create 2nd user", async () => {
    const email = "xxx@yyy.zzz";
    const created = (
      await register(api, email)
        .expect(200)
        .expect("Content-Type", /application\/json/)
    ).body;

    expect(created).toHaveLength(1);
    const login_res = await login(api, email);

    expect(login_res.body.token.length).toBeGreaterThan(7);
  });
});
