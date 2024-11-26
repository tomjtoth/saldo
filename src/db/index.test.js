const fs = require("fs");
const { db, run, all } = require("./");

const schema = fs.readFileSync("./src/db/schema.sql").toString();

const get = (type) =>
  all("select name from sqlite_master where type = ?", [type]);

const reset_db = () => {
  return new Promise((resolve) => {
    db.serialize(async () => {
      const tables = await get("table");
      const views = await get("view");
      await Promise.all(
        tables
          .map(({ name }) => run(`drop table if exists ${name}`))
          .concat(views.map(({ name }) => run(`drop view if exists ${name}`)))
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

test("resetting DB works", async () => {
  await reset_db();
  expect(await get("table")).toHaveLength(13);
  expect(await get("view")).toHaveLength(3);
});

module.exports = {
  reset_db,
};
