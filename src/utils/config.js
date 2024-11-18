require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_PATH: process.env.DB_PATH || "prod.db",
  IMPORT_CSV: process.env.IMPORT_CSV,
  MIGRATE_DB: process.env.MIGRATE_DB,
  SECRET: process.env.SECRET,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM: process.env.SENDGRID_FROM,
};
