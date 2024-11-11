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

function body_validator(req, _res, next) {
  const {
    params: { tbl },
    body,
  } = req;
  if (!tbl.endsWith("_history") && Array.isArray(body))
    req.body = body.map((entity) => new validators[tbl](entity));

  next();
}

module.exports = {
  token_extractor,
  user_extractor,
  auth_checker,
  body_validator,
};
