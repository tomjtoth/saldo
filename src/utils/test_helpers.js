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

const crud_works = async ({
  api,
  route,
  headers,
  initial_payload,
  modifier,
  modified_checker,
}) => {
  const { body: created } = await endpoint(api, route, {
    send: initial_payload,
    method: "post",
    headers,
    code: 201,
  });

  created.forEach((obj, i) => {
    expect(obj).toStrictEqual({
      ...initial_payload[i],
      // SQLite3 starts from integer 1 as primary key
      id: i + 1,
      status_id: 0,
    });
  });

  const { body: modified } = await endpoint(api, route, {
    send: created.map(modifier),
    method: "put",
    headers,
    code: 201,
  });

  modified.forEach(modified_checker);

  const { body: deleted } = await endpoint(api, route, {
    send: modified,
    method: "delete",
    headers,
    code: 201,
  });

  deleted.forEach((deleted, i) => {
    expect(deleted).toStrictEqual({ ...modified[i], status_id: 1 });
  });

  const { body: queried } = await endpoint(api, route);

  expect(queried).toStrictEqual(deleted);
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

const login = (api, { email, ...rest } = {}) => {
  return endpoint(api, "/api/login", {
    method: "post",
    ...rest,
    send: {
      email: email || DUMMY_USER.email,
      password: DUMMY_USER.passwd,
    },
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
  crud_works,
  DUMMY_USER,
};
