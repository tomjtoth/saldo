const { v4: uuid } = require("uuid");
const { reset_db } = require("../db");

const endpoint = (
  api,
  route,
  {
    method = "post",
    headers,
    code = 201,
    expect = [["Content-Type", /application\/json/]],
    send,
  } = {}
) => {
  api = api[method](route).expect(code);

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
  // 0 is the registered user
  rev_id = 1,
}) => {
  const { body: created } = await endpoint(api, route, {
    send: initial_payload,
    headers,
  });

  created.forEach((obj, id) => {
    expect(obj).toStrictEqual({
      ...initial_payload[id],
      id,
      status_id: 0,
      rev_id,
    });
  });

  const { body: modified } = await endpoint(api, route, {
    send: created.map(modifier),
    method: "put",
    headers,
  });

  modified.forEach(modified_checker);

  const { body: deleted } = await endpoint(api, route, {
    send: modified,
    method: "delete",
    headers,
  });

  deleted.forEach((deleted, i) => {
    expect(deleted).toStrictEqual({
      ...modified[i],
      rev_id: modified[i].rev_id + 1,
      status_id: 1,
    });
  });

  const { body: queried } = await endpoint(api, route, {
    method: "get",
    code: 200,
  });

  expect(queried).toStrictEqual(deleted);
};

const DUMMY_USER = {
  email: "dummy@test.user",
  name: "Dummy user",
  // just in case someone does tests on a prod db and forgets about them
  passwd: uuid(),
};

const register = (api, { email, ...opts } = {}) => {
  return endpoint(api, "/api/users", {
    send: [{ ...DUMMY_USER, email: email || DUMMY_USER.email }],
    ...opts,
  });
};

const login = (api, { email, ...rest } = {}) => {
  return endpoint(api, "/api/login", {
    ...rest,
    code: 200,
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
