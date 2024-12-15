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

const crud = async ({
  api,
  route,
  headers,
  dummy,
  comp_created = (dummy, created) => {
    expect(created).toStrictEqual({
      ...dummy,
      id: 0,
      rev_id: 1,
      status_id: 0,
    });
  },
  modifier,
  comp_modified,
  comp_deleted = (modified, deleted) => {
    expect(deleted).toStrictEqual({
      ...modified,
      rev_id: 3,
      status_id: 1,
    });
  },
  comp_queried = (deleted, queried) => {
    expect(queried).toStrictEqual(deleted);
  },
}) => {
  const {
    body: [created],
  } = await endpoint(api, route, {
    send: dummy,
    headers,
  });

  comp_created(dummy, created);

  const route_id = `${route}/${created.id}`;

  const { body: modified } = await endpoint(api, route_id, {
    send: modifier(created),
    method: "put",
    headers,
  });

  comp_modified(created, modified);

  const { body: deleted } = await endpoint(api, route_id, {
    method: "delete",
    headers,
  });

  comp_deleted(modified, deleted);

  const {
    body: [queried],
  } = await endpoint(api, route_id, {
    method: "get",
    code: 200,
  });

  comp_queried(deleted, queried);
};

const DUMMY_USER = {
  email: "dummy@test.user",
  name: "Dummy user",
  // just in case someone does tests on a prod db and forgets about them
  passwd: uuid(),
};

const register = (api, { email, ...opts } = {}) => {
  return endpoint(api, "/api/users", {
    send: { ...DUMMY_USER, email: email || DUMMY_USER.email },
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
  crud,
  DUMMY_USER,
};
