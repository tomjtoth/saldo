require("dotenv").config();
const { v4: uuid } = require("uuid");

// defaults and fallbacks
const config = {
  SECRET: uuid(),
  PORT: 3000,
  NODE_ENV: "prod",

  MIGRATE_DB: undefined,

  IMPORT_CSV: false,

  EMAIL_PASS: undefined,
  EMAIL_FROM: undefined,
};

Object.keys(config).forEach((key) => {
  const env = process.env[key];
  if (env !== undefined) config[key] = env;
});

module.exports = config;
