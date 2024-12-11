const supertest = require("supertest");
const User = require("./user");
const { reset_db } = require("../db");
const {
  prep3,
  register,
  login,
  DUMMY_USER,
  crud_works,
} = require("../utils/test_helpers");
const api = supertest(require("../app"));

jest.setTimeout(60 * 60 * 1000);

const DUMMIES = [
  { ...DUMMY_USER, name: "qwe" },
  { ...DUMMY_USER, email: "a@b.cd" },
  { ...DUMMY_USER, passwd: "        " },
];

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

  expect(() => {
    new User({ ...DUMMY_USER, passwd: "qwer" });
  }).toThrow();

  // the below pass
  DUMMIES.forEach((dummy) => new User(dummy));
});

test("can register in empty db", async () => {
  await reset_db();

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

  test("cannot register w/ same email", async () => {
    await register(api, { code: 400, expect: [] });
  });

  test("POST, PUT, DELETE, GET works", async () => {
    await crud_works({
      api,
      route: "/api/users",
      headers,
      initial_payload: DUMMIES,
      created_checker: (created, id) => {
        expect(created).toStrictEqual({
          ...DUMMIES[id],
          id,
          status_id: 0,
          rev_id: 1 + id,
        });
      },
      modifier: ({ email, ...rest }) => {
        email = email.replace("@", ".modified@");
        return { email, ...rest };
      },
      modified_checker: ({ email }) =>
        expect(email).toMatch(/.+\.modified@.{2,}/),
    });
  });
});
