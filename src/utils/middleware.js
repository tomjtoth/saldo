const jwt = require("jsonwebtoken");
const models = require("../models");
const { SECRET } = require("../utils/config");
const svc = require("../services");

const token_extractor = (req, _res, next) => {
  const auth = req.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    req.token = auth.slice(7);
  }
  next();
};

const user_extractor = async (req, _res, next) => {
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
};

function auth_checker({ params: { tbl }, method, user }, _res, next) {
  if (!user && !(tbl === "users" && method === "POST"))
    return next({
      name: "auth",
      message: `must be signed in in order to ${
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
  auth_checker,
  body_validator,
  error_handler,
};
