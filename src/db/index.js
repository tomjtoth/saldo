const { promisify } = require("util");
const sqlite3 = require("sqlite3").verbose();
const { DB_PATH, NODE_ENV } = require("../utils/config");

const db = new sqlite3.Database(NODE_ENV === "test" ? ":memory:" : DB_PATH);

const run = promisify(db.run.bind(db));
const get = promisify(db.get.bind(db));
const all = promisify(db.all.bind(db));

const begin = () => run("begin");
const commit = () => run("commit");
const rollback = () => run("rollback");

/**
 * the maximum value of a host parameter number is
 * SQLITE_MAX_VARIABLE_NUMBER, which defaults to
 * 32766 for SQLite versions after 3.32.0.
 */
const SQLITE_MAX_VARIABLE_NUMBER = 32766;

module.exports = {
  db,
  SQLITE_MAX_VARIABLE_NUMBER,
  run,
  get,
  all,
  begin,
  commit,
  rollback,
};
