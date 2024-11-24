const fs = require("fs");
const { run, all } = require("../db");

module.exports = async () => {
  const tables = await all(
    "select name from sqlite_master where type = 'table'"
  );
  await run(fs.readFileSync("../db/schema.sql"));
};
