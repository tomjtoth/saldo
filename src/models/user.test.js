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

describe("via /api/endpoint", () => {
  beforeEach(async () => {
    headers = await prep3(api);
  });

  test("can create 2nd user", async () => {
    const email = "xxx@yyy.zzz";
    const { body: registered } = await register(api, { email });

    expect(registered).toHaveLength(1);
    const { body: logged_in } = await login(api, { email });

    expect(logged_in.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
  });
});
