const db = require("../db");

/**
 * the maximum value of a host parameter number is
 * SQLITE_MAX_VARIABLE_NUMBER, which defaults to
 * 32766 for SQLite versions after 3.32.0.
 */
module.exports = function (tbl, cols, arr) {
  const vars_per_row = cols.split(/, */).length;
  const max_rows_at_a_time = Math.floor(32766 / vars_per_row);

  while (arr.length !== 0) {
    let splice = arr.splice(0, max_rows_at_a_time);

    db.run(
      `insert into ${tbl} (${cols}) values ${splice
        .map(() => `(${cols.replaceAll(/\w+/g, "?")})`)
        .join(",")};`,
      splice.flat(),
      function (err) {
        if (err) {
          console.error(err.message);
        } else {
          console.log(`Rows inserted into ${tbl}: ${this.changes}`);
        }
      }
    );
  }
};
