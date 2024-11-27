const { v4: uuid } = require("uuid");
const { reset_db } = require("../db");

const endpoint = (api, route, opts = {}) => {
  const {
    method = "get",
    headers,
    code = 200,
    expect = [["Content-Type", /application\/json/]],
    send,
  } = opts;

  api = api[method](route).expect(code);

  if (expect)
    expect.forEach(
      (x) => (api = Array.isArray(x) ? api.expect(...x) : api.expect(x))
    );
  if (headers) api = api.set(headers);
  if (send) api = api.send(send);

  return api;
};

const DUMMY_USER = {
  email: "dummy@test.user",
  name: "Dummy user",
  // just in case someone does tests on a prod db and forgets about them
  passwd: uuid(),
};

const register = (api, opts = {}) => {
  const { email, ...rest } = opts;

  return endpoint(api, "/api/users", {
    method: "post",
    send: [{ ...DUMMY_USER, email: email || DUMMY_USER.email }],
    code: 201,
    ...rest,
  });
};

const login = (api, opts = {}) => {
  const { email, ...rest } = opts;

  return endpoint(api, "/login", {
    method: "post",
    send: {
      email: email || DUMMY_USER.email,
      password: DUMMY_USER.passwd,
    },
    ...rest,
  });
};

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
  endpoint,
  DUMMY_USER,
};
