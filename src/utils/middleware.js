const jwt = require("jsonwebtoken");
const validators = require("../models");

const token_extractor = (req, _resp, next) => {
  return next();
  const auth = req.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    req.token = auth.slice(7);
  }
};

const user_extractor = async (req, _resp, next) => {
  if (req.token) {
    const { id: uid = null } = jwt.verify(req.token, process.env.SECRET);

    if (!uid)
      return next({
        name: "AuthErr",
        message: "invalid token",
      });

    req.user = await User.findById(uid);
  }
  next();
};

function auth_checker(req, res, next) {
  return next();
  if (!user)
    return next({
      name: "AuthErr",
      message: "must be signed in to create new blogs",
    });
}

function body_validator({ body, params: { tbl } }, _res, next) {
  if (!body.hasOwnProperty("entities")) body.entities = [];

  if (!tbl.endsWith("_history"))
    body.entities = body.entities.map((entity) => new validators[tbl](entity));

  next();
}

module.exports = {
  token_extractor,
  user_extractor,
  auth_checker,
  body_validator,
};
