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

  const t = db.transaction(() => {
    let res: T;

    if (revisedBy) {
      const [rev] = Revisions.insert({ revisedBy });

      res = (operation as (rev: TRevision) => T)(rev);

      if (rev.id % DB_BACKUP_EVERY_N_REVISIONS == 0)
        db.backup(`${DB_PATH}.backup.${rev.id}`);
    } else res = (operation as () => T)();

    return res;
  });

  try {
    const res = (mode ? t[mode] : t)();

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
