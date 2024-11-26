const supertest = require("supertest");
const { reset_db } = require("../db/index.test");
const { v4: uuid } = require("uuid");

const DUMMY_USER = {
  email: "dummy@test.user",
  name: "Dummy user",
  passwd: uuid(),
};
const api = supertest(require("../app"));

const register = (email = null) => {
  const { email: _s, ...rest } = DUMMY_USER;

  return api.post("/api/users").send({
    entities: [{ ...rest, email: email || DUMMY_USER.email }],
  });
};

const login = (email = null) => {
  return api.post("/login").send({
    email: email || DUMMY_USER.email,
    password: DUMMY_USER.passwd,
  });
};

beforeEach(async () => {
  await reset_db();
});

test("can register in empty db", async () => {
  const res = await register()
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
    await register();
  });

  test("cannot register w/ same email", async () => {
    await register().expect(400);
  });
});

module.exports = {
  register,
  login,
};
