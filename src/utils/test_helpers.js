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

const crud_works = async (api, route, headers, initial_payload) => {
  const { body: created } = await endpoint(api, route, {
    send: initial_payload,
    method: "post",
    headers,
    code: 201,
  });

  expect(created).toHaveLength(3);

  const { body: modified } = await endpoint(api, route, {
    send: created.map((cat) => {
      cat.category += " modified";
      return cat;
    }),
    method: "put",
    headers,
    code: 201,
  });

  modified.forEach(({ category }) => expect(category).toMatch(/.+ modified$/));

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
  crud_works,
  DUMMY_USER,
};
