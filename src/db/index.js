const postgres = require("postgres");

/**
 * https://www.postgresql.org/docs/current/postgres-fdw.html
 *
 * "...limits the number of parameters in a single query to 65535."
 *
 * TODO: see if psql breaks without my SQLite-related logic
 */
const MAX_POSITIONAL_PARAMS = 65535;

const sql = postgres();

async function reset_db() {
  return sql`truncate revisions cascade`;
}

module.exports = {
  sql,
  reset_db,
  MAX_POSITIONAL_PARAMS,
};
