const supertest = require("supertest");
const { reset_db } = require("../db");
const { login, register, DUMMY_USER } = require("../utils/test_helpers");
const api = supertest(require("../app"));

beforeEach(reset_db);

test("can register in empty db", async () => {
  const res = await register(api)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  expect(res.body[0]).toStrictEqual({
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
    await register(api).expect(400);
  });
});
