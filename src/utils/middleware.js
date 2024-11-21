const jwt = require("jsonwebtoken");
const models = require("../models");
const { SECRET } = require("../utils/config");

function token_extractor(req, _res, next) {
  const auth = req.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    req.token = auth.slice(7);
  }
  next();
}

async function passwd_hasher(
  { params: { tbl }, body: { entities } },
  _res,
  next
) {
  if (tbl === "users") {
    await Promise.all(entities.map((u) => u.hash()));
  }
  next();
}

async function user_extractor(req, _res, next) {
  if (req.token) {
    const { id } = jwt.verify(req.token, SECRET);

    if (id === undefined)
      return next({
        name: "auth",
        message: "invalid token",
      });

    const [user] = await models.users.select({ where: { id } });

    if (!user)
      return next({
        name: "auth",
        message: "wrong user.id",
      });

    req.user = user;
  }
  next();
}

function auth_checker({ params: { tbl }, method, user }, _res, next) {
  // after importing use a breakpoint here to override `user` while updating the 1st email:passwd
  if (!user && !(tbl === "users" && method === "POST"))
    return next({
      name: "auth",
      message: `You must be signed in in order to ${
        method === "PUT" ? "update" : method.toLowerCase()
      } ${tbl}`,
    });

  next();
}

function body_validator(req, _res, next) {
  const {
    body,
    params: { tbl },
    method,
  } = req;
  if (body.entities === undefined) body.entities = [];

  if (!tbl.endsWith("_history")) {
    if (method === "POST" && tbl === "receipts") {
      // do nothing as the controller takes care of everything?
    } else body.entities = models[tbl].from(body.entities);
  }

  next();
}

function error_handler(error, _req, res, next) {
  const { code, name, message } = error;

  if (code === "SQLITE_CONSTRAINT") return res.status(400).send(message);

  if (name === "auth" || name === "JsonWebTokenError")
    return res.status(401).send(message);

  if (name === "model field validation") return res.status(400).send(message);

  next(error);
}

module.exports = {
  token_extractor,
  user_extractor,
  passwd_hasher,
  auth_checker,
  body_validator,
  error_handler,
};
