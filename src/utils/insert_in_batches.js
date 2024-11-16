const db = require("../db");

/**
 * the maximum value of a host parameter number is
 * SQLITE_MAX_VARIABLE_NUMBER, which defaults to
 * 32766 for SQLite versions after 3.32.0.
 */
const SQLITE_MAX_VARIABLE_NUMBER = 32766;

module.exports = function (tbl, arr) {
  const { columns, placeholders } = arr[0].cols_n_phs();
  const cols_str = `(${columns.join(",")})`;

  const max_rows_at_a_time = Math.floor(
    SQLITE_MAX_VARIABLE_NUMBER / columns.length
  );

  while (arr.length !== 0) {
    const splice = arr.splice(0, max_rows_at_a_time);
    db.run(
      `insert into ${tbl} ${cols_str} values ${splice
        .map(() => placeholders)
        .join(",")}`,
      splice.flatMap((e) => e.as_sql_params(columns)),
      function (err) {
        if (err) console.error(err.message);
        else console.log(`Rows inserted into ${tbl}: ${this.changes}`);
      }
    );
  }
};
