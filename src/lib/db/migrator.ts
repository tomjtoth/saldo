import fs, { Dirent } from "fs";

import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { err } from "../utils";

const MIG_DIR = "prisma/migrations";
const migName = (mig: Dirent<string>) =>
  mig.parentPath.slice(MIG_DIR.length + 1);

export const migrator = {
  up: async () => {
    const db = new Database(
      // file:../data/dev.db
      process.env.DATABASE_URL?.slice(8) ?? ":memory:",
      OPEN_CREATE | OPEN_READWRITE
    );

    const query = (sql: string, values?: unknown[]) =>
      new Promise<unknown[]>((resolve, reject) => {
        db.all(sql, values, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

    const exec = (sql: string) =>
      new Promise<void>((resolve, reject) => {
        db.exec(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

    await exec(`CREATE TABLE IF NOT EXISTS meta (
      id INTEGER PRIMARY KEY,
      info TEXT NOT NULL UNIQUE,
      data BLOB
    );`);

    const separateMigrationsTableExists =
      (await query("SELECT 1 FROM sqlite_master WHERE tbl_name = 'migrations'"))
        .length > 0;

    if (separateMigrationsTableExists) {
      await exec(`
        INSERT INTO meta (info, data)
        SELECT 'migrations', json_group_array(name)
        FROM migrations ORDER BY name;

        DROP TABLE migrations;
      `);
    }

    const done = (
      (await query(
        "SELECT value FROM meta, json_each(data) WHERE info = 'migrations'"
      )) as { value: string }[]
    ).map((x) => x.value);

    const migrations = fs
      .readdirSync(MIG_DIR, {
        recursive: true,
        withFileTypes: true,
        encoding: "utf-8",
      })
      .filter(
        (file) =>
          !file.parentPath.endsWith("20250708_pre-prisma") &&
          file.name.endsWith(".sql") &&
          // without the prisma/migrations path
          !done.includes(migName(file))
      );

    const res: string[] = [];

    const trimmer = new RegExp(
      [
        "^ *(?:",

        [
          "BEGIN *(?:DEFERRED|IMMEDIATE|EXCLUSIVE)? *(?:TRANSACTION)?",
          "(?:COMMIT|END) *(?:TRANSACTION)?",
          "VACUUM",
        ].join("|"),

        ") *; *$",
      ].join(""),
      "mig"
    );

    try {
      for (const mig of migrations) {
        const script = fs.readFileSync(`${mig.parentPath}/${mig.name}`, {
          encoding: "utf-8",
        });

        const trimmed = script.replaceAll(trimmer, "");

        await exec("PRAGMA foreign_keys = OFF;");
        await exec("BEGIN;");

        try {
          await exec(trimmed);

          const violations = await query("PRAGMA foreign_key_check;");
          const len = violations.length;

          if (len > 0)
            err(
              `${len} foreign_key violations occured during "${
                mig.parentPath
              }":\n\n${JSON.stringify(violations, null, "\t")}\n`
            );

          await exec("COMMIT;");

          await query(
            `INSERT INTO meta (info, data) VALUES ('migrations', json_array(?1))
            ON CONFLICT DO UPDATE SET data = json_insert(data, '$[#]', ?1)`,
            [migName(mig)]
          );
        } catch (err) {
          await exec("ROLLBACK;");
          throw err;
        } finally {
          await exec("PRAGMA foreign_keys = ON;");
        }

        res.push(migName(mig));
      }
    } catch (err) {
      throw err;
    } finally {
      await exec("VACUUM");
      db.close();
    }

    return res;
  },
};
