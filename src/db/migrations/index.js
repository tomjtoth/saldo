const { readFileSync, existsSync, readdirSync } = require("fs");
const { db } = require("..");

const migrate = () => {
  db.all("select * from migrations", function (_err, rows) {
    const alreadyDone = rows.map((r) => r.migration);

    // path relative to working_dir
    readdirSync("./src/db/migrations", { withFileTypes: true })
      .reduce((arr, entry) => {
        if (entry.isDirectory() && !alreadyDone.includes(entry.name))
          arr.push(entry.name);

        return arr;
      }, [])
      .sort()
      .forEach((dir) => {
        const script = `${dir}/up.sql`;

        if (!existsSync(script)) {
          console.error(`"${script}" does not exist!`);
          process.exit(1);
        }

        const migration = readFileSync(script);

        db.serialize(() => {
          db.run(migration);
          db.run("insert into migrations(migration) values (?)", [dir]);
        });
      });
  });
};

const revert = () => {
  db.get(
    "select * from migrations order by id desc limit 1",
    function (_err, row) {
      const migration = readFileSync(`${row.migration}/down.sql`);
      db.serialize(() => {
        db.run(migration);
        db.run("delete from migrations where id = ?", [row.id]);
      });
    }
  );
};

module.exports = { migrate, revert };
