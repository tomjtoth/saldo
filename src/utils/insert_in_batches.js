const db = require("../db");
const process_entities = require("./process_entities");

/**
 * the maximum value of a host parameter number is
 * SQLITE_MAX_VARIABLE_NUMBER, which defaults to
 * 32766 for SQLite versions after 3.32.0.
 */
const SQLITE_MAX_VARIABLE_NUMBER = 32766;

module.exports = function (tbl, arr) {
  const { cols, placeholders, params_as_arr } = process_entities(arr);

  const max_rows_at_a_time = Math.floor(
    SQLITE_MAX_VARIABLE_NUMBER / cols.length
  );

  while (params_as_arr.length !== 0) {
    const splice = params_as_arr.splice(0, max_rows_at_a_time);
    db.run(
      `insert into ${tbl} (${cols.join(",")}) values ${splice
        .map(() => placeholders)
        .join(",")}`,
      splice.flat(),
      function (err) {
        if (err) console.error(err.message);
        else console.log(`Rows inserted into ${tbl}: ${this.changes}`);
      }
    );
  }
};
