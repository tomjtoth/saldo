const supertest = require("supertest");
const { prep3, login } = require("../utils/test_helpers");

const api = supertest(require("../app"));

beforeEach(async () => {
  await prep3(api);
});

test("dummy user can log in", async () => {
  await login(api);
});
