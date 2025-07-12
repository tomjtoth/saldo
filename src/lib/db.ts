import fs from "fs";

import Database from "better-sqlite3";

import { datetimeToInt, err } from "./utils";

const DB_PATH =
  process.env.NODE_ENV === "test"
    ? ":memory:"
    : process.env.DB_PATH ||
      `data/${process.env.NODE_ENV === "production" ? "prod" : "dev"}.db`;

export const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

const RE_SPLITTER = /(.+)^--\s*DOWN\s*--$(.*)/ms;

export const migrator: {
  truncate: () => void;
  up: () => { changes: number; migration: string }[];
} = {
  truncate: () => db.exec("DELETE FROM revisions;"),

  up: () => {
    db.exec(`CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT
    );`);

    const done = db
      .prepare("SELECT name FROM migrations")
      .pluck()
      .all() as string[];

    const res = fs
      .readdirSync("migrations")
      .filter((file) => file.endsWith(".sql") && !done.includes(file))
      .map((migTodo) => {
        const mig = fs.readFileSync(`migrations/${migTodo}`, {
          encoding: "utf-8",
        });

        const split = mig.match(RE_SPLITTER);

        if (!split) err(`missing '^-- DOWN --$' line in "${migTodo}"`);

        const [, up] = split;

        return db.transaction(() => {
          const { changes } = db.prepare(up).run();
          db.prepare("INSERT INTO migrations (name) VALUES (?)").run(migTodo);

          return { changes, migration: migTodo };
        })();
      });

    db.exec("VACUUM");

    return res;
  },
};
