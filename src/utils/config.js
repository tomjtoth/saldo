require("dotenv").config();
const { v4: uuid } = require("uuid");

const u = undefined;
const config = {
  PORT: 3000,
  DB_PATH: "prod.db",
  IMPORT_CSV: u,
  MIGRATE_DB: u,
  SECRET: uuid(),
  EMAIL_PASS: u,
  EMAIL_FROM: u,
};

Object.keys(config).forEach((key) => {
  const env = process.env[key];
  if (env !== undefined) config[key] = env;
});

module.exports = config;
