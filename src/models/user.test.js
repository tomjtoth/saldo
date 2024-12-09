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

jest.setTimeout(60 * 60 * 1000);

describe("", async () => {
  beforeEach(async () => {
    await reset_db();
  });

  test("can register in empty db", async () => {
    const {
      body: [created],
    } = await register(api);

    expect(created).toStrictEqual({
      id: 0,
      status_id: 0,
      rev_id: 0,
      email: DUMMY_USER.email,
      name: DUMMY_USER.name,
    });
  });

  describe("after dummy user registered", () => {
    beforeEach(async () => {
      await register(api);
    });

    test("cannot register w/ same email", async () => {
      await register(api, { code: 400, expect: [] });
    });
  });
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
