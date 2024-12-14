const postgres = require("postgres");
require("../utils/config");

/**
 * in https://www.postgresql.org/docs/current/postgres-fdw.html reads:
 * "...limits the number of parameters in a single query to 65535."
 *
 * also ran into the below error while importing from v3:
 * "...Max number of parameters (65534) exceeded"
 *
 */
const MAX_POSITIONAL_PARAMS = 65534;

const sql = postgres({
  onnotice: (...args) => {
    args.forEach((arg) => {
      if (!arg.message.startsWith("truncate cascades to table"))
        console.log(arg);
    });
  },
});

function in_chunks(arr, callback) {
  const model = arr[0].constructor;
  const chunk_size = Math.floor(MAX_POSITIONAL_PARAMS / model.cols().length);

  return arr.toChunks(chunk_size).map(callback);
}

function recurse(arr, { lop = sql`and` } = {}) {
  if (arr.length == 0) return sql``;

  let [key, val] = arr.pop();

  const col = sql.unsafe(key);
  const op = Array.isArray(val) ? sql`in` : sql`=`;
  val = Array.isArray(val) ? sql(val) : val;

  return sql`${lop} (${col} ${op} ${val} ${recurse(arr)})`;
}

function where(crit = {}) {
  return sql`where true ${recurse(Object.entries(crit))}`;
}

function reset_db() {
  return sql.begin((sql) => [
    sql`truncate
    revisions,
    statuses
    cascade`,

    sql`insert into statuses ${sql([
      { id: 0, status: "default" },
      { id: 1, status: "deleted" },
    ])}`,
  ]);
}

module.exports = {
  sql,
  where,
  reset_db,
  in_chunks,
};
