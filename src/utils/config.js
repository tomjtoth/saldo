require("dotenv").config();
const { v4: uuid } = require("uuid");

// defaults and fallbacks
const config = {
  NODE_ENV: "prod",
  PORT: 3000,
  DB_PATH: "prod.db",
  IMPORT_CSV: false,
  MIGRATE_DB: undefined,
  SECRET: uuid(),
  EMAIL_PASS: undefined,
  EMAIL_FROM: undefined,
};

Object.keys(config).forEach((key) => {
  const env = process.env[key];
  if (env !== undefined) config[key] = env;
});

module.exports = config;
