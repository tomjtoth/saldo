import fs from "fs";

import Database from "better-sqlite3";

import { err } from "./utils";
import { Revisions, TRevision } from "./models";

const DB_BACKUP_EVERY_N_REVISIONS = 50;
const DB_PATH =
  process.env.NODE_ENV === "test"
    ? ":memory:"
    : process.env.DB_PATH ||
      `data/${process.env.NODE_ENV === "production" ? "prod" : "dev"}.db`;

export const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

type AtomicOpts = {
  operation?: string;
  transaction?: "deferred" | "immediate" | "exclusive";
};

type AtomicWithRevOpts = AtomicOpts & {
  revisedBy: number;
};

export function atomic<T>(
  options: AtomicWithRevOpts,
  operation: (revision: TRevision) => T
): T;
export function atomic<T>(options: AtomicOpts, operation: () => T): T;
export function atomic<T>(operation: () => T): T;

export function atomic<T>(
  optsOrFn: AtomicOpts | (() => T),
  maybeFn?: ((revision: TRevision) => T) | (() => T)
): T {
  const isFnOnly = typeof optsOrFn === "function";
  const opts = isFnOnly ? {} : optsOrFn;
  const operation = isFnOnly ? optsOrFn : maybeFn!;
  const {
    revisedBy,
    operation: opDescription,
    transaction: mode,
  } = opts as AtomicWithRevOpts;
  let revision: TRevision | null = null;

  const t = db.transaction(() => {
    let res: T;

    if (revisedBy) {
      revision = Revisions.insert({ revisedBy })[0]!;

      res = (operation as (rev: TRevision) => T)(revision);
    } else res = (operation as () => T)();

    return res;
  });

  try {
    const res = (mode ? t[mode] : t)();

    if (revision) {
      const rev = revision as TRevision;
      if (rev.id % DB_BACKUP_EVERY_N_REVISIONS == 0)
        db.backup(`${DB_PATH}.backup.${rev.id}`);
    }

    console.log(`\n\t${opDescription ?? "Transaction"} succeeded!\n`);

    return res;
  } catch (err) {
    console.error(
      `\n\t${opDescription ?? "Transaction"} failed:`,
      (err as Error).message,
      "\n"
    );
    throw err;
  }
}

const RE_SPLITTER = /(.+)^--\s*DOWN\s*--$(.*)/ms;

export const migrator = {
  truncate: () => {
    db.exec("DELETE FROM revisions;");
  },

  up: () => {
    db.exec(`CREATE TABLE IF NOT EXISTS meta (
      id INTEGER PRIMARY KEY,
      info TEXT NOT NULL UNIQUE,
      data BLOB
    );`);

    const done = db
      .prepare(
        "SELECT value FROM meta, json_each(data) WHERE info = 'migrations'"
      )
      .pluck()
      .all() as string[];

    db.pragma("foreign_keys = OFF");
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

        db.transaction(() => {
          db.exec(up);
          db.prepare(
            `INSERT INTO meta (info, data) VALUES ('migrations', jsonb_array(:migTodo))
            ON CONFLICT DO UPDATE SET data = jsonb_insert(data, '$[#]', :migTodo)`
          ).run({ migTodo });
        })();

        return migTodo;
      });

    db.pragma("foreign_keys = ON");
    db.exec("VACUUM");

    return res;
  },
};
