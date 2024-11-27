const supertest = require("supertest");
const { register, DUMMY_USER } = require("../utils/test_helpers");
const { reset_db } = require("../db");

const api = supertest(require("../app"));

beforeEach(async () => {
  await reset_db();
});

test("can register in empty db", async () => {
  const {
    body: [created],
  } = await register(api);

  expect(created).toStrictEqual({
    id: 1,
    status_id: 0,
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
