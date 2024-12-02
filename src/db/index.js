const postgres = require("postgres");

/**
 * in https://www.postgresql.org/docs/current/postgres-fdw.html reads:
 * "...limits the number of parameters in a single query to 65535."
 *
 * also ran into the below error while importing from v3:
 * "...Max number of parameters (65534) exceeded"
 *
 */
const MAX_POSITIONAL_PARAMS = 65534;

const sql = postgres();

function rows_at_a_time(cols) {
  return Math.floor(MAX_POSITIONAL_PARAMS / cols.length);
}

async function reset_db() {
  return sql`truncate
    id.users,
    id.receipts,
    id.items,
    id.categories,
    revisions,
    statuses
    cascade`;
}

module.exports = {
  sql,
  reset_db,
  rows_at_a_time,
};
