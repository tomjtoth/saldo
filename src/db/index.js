const fs = require("fs");
const { promisify } = require("util");
const sqlite3 = require("sqlite3").verbose();
const { DB_PATH } = require("../utils/config");

const db = new sqlite3.Database(DB_PATH);
const schema = fs.readFileSync("./src/db/schema.sql").toString();

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

const qry_mstr = (type) =>
  all("select name from sqlite_master where type = ?", [type]);

const reset_db = () => {
  return new Promise((resolve) => {
    db.serialize(async () => {
      const tables = await qry_mstr("table");
      const views = await qry_mstr("view");
      await Promise.all(
        tables
          .map(({ name }) => run(`drop table ${name}`))
          .concat(views.map(({ name }) => run(`drop view ${name}`)))
      );

      await Promise.all(
        schema
          .matchAll(/(?<=\n|^)create (?:.|\n)+?(?=create|$)/gis)
          .map(([create_satement]) => run(create_satement))
      );

      resolve();
    });
  });
};

module.exports = {
  db,
  reset_db,
  qry_mstr,
  SQLITE_MAX_VARIABLE_NUMBER,
  run,
  get,
  all,
  begin,
  commit,
  rollback,
};
