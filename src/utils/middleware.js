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
  if (method !== "get" && tbl.startsWith("history."))
    return next({
      name: "auth403",
      message: "modifying historical data is not allowed",
    });

  if (!user && !(tbl === "users" && method === "POST"))
    return next({
      name: "auth",
      message: `You must be signed in in order to ${
        method === "PUT" ? "update" : method.toLowerCase()
      } ${tbl}`,
    });

  next();
}

function error_handler(error, _req, res, next) {
  const { name, message } = error;

  if (name === "model field validation" || name === "missing payer")
    return res.status(400).send(message);

  if (name === "auth" || name === "JsonWebTokenError")
    return res.status(401).send(message);

  if (name === "auth403") {
    return res.status(403).send(message);
  }

  next(error);
}

module.exports = {
  token_extractor,
  user_extractor,
  auth_checker,
  error_handler,
};
