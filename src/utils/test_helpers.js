const { v4: uuid } = require("uuid");

const DUMMY_USER = {
  email: "dummy@test.user",
  name: "Dummy user",
  passwd: uuid(),
};

const register = (api, email = undefined) =>
  api.post("/api/users").send({
    entities: [{ ...DUMMY_USER, email: email || DUMMY_USER.email }],
  });

const login = (api, email = undefined) =>
  api.post("/login").send({
    email: email || DUMMY_USER.email,
    password: DUMMY_USER.passwd,
  });

module.exports = {
  login,
  register,
  DUMMY_USER,
};
