const jwt = require("jsonwebtoken");
const { hash } = require("bcrypt");
const models = require("../models");
const { SECRET } = require("../utils/config");
const { generic: svc } = require("../services");

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
    const saltRounds = 10;
    await Promise.all(
      entities.map(async (user) => {
        user.passwd = await hash(user.passwd, saltRounds);
      })
    );
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

    const [user] = await svc.query("users", { where: "id = ?", params: [id] });
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

function body_validator({ body, params: { tbl } }, _res, next) {
  if (!body.hasOwnProperty("entities")) body.entities = [];

  if (!tbl.endsWith("_history"))
    body.entities = body.entities.map((entity) => new models[tbl](entity));

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
