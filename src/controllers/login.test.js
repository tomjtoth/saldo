const supertest = require("supertest");
const { reset_db } = require("../db");
const { register, login } = require("../utils/test_helpers");

const api = supertest(require("../app"));

beforeEach(async () => {
  await reset_db();
  await register(api);
});

test("dummy user can log in", async () => {
  await login(api);
});
