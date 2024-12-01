require("dotenv").config();
const { v4: uuid } = require("uuid");

// defaults and fallbacks
const config = {
  SECRET: uuid(),
  PORT: 3000,
  NODE_ENV: "prod",

  POSTGRES_HOST: undefined,
  POSTGRES_PORT: 5432,
  POSTGRES_USER: undefined,
  POSTGRES_PASSWORD: undefined,
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
