const { v4: uuid } = require("uuid");
const { reset_db } = require("../db");

const DUMMY_USER = {
  email: "dummy@test.user",
  name: "Dummy user",
  passwd: uuid(),
};

const register = (api, email = undefined) =>
  api
    .post("/api/users")
    .send([{ ...DUMMY_USER, email: email || DUMMY_USER.email }]);

const login = (api, email = undefined) =>
  api.post("/login").send({
    email: email || DUMMY_USER.email,
    password: DUMMY_USER.passwd,
  });

/**
 * resets db, registers and logs the DUMMY_USER in
 * @param {SuperTest} api
 * @returns `{ Authorization: Bearer <token> }`
 */
const prep3 = async (api) => {
  await reset_db();
  await register(api);
  const {
    body: { token },
  } = await login(api);

  return { Authorization: `Bearer ${token}` };
};

module.exports = {
  login,
  register,
  prep3,
  DUMMY_USER,
};
