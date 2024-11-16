const validators = require("../models");

const token_extractor = (req, _resp, next) => {
  return next();
};

const user_extractor = async (req, _resp, next) => {
  return next();
};

function auth_checker(req, res, next) {
  return next();
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
