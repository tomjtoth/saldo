import fs from "fs";

import sqlite3, { OPEN_CREATE, OPEN_READWRITE } from "sqlite3";
import { Sequelize, Transaction } from "sequelize";
import { Umzug } from "umzug";

const storage =
  process.env.NODE_ENV === "test"
    ? ":memory:"
    : process.env.DB_PATH ||
      `data/${process.env.NODE_ENV === "production" ? "prod" : "dev"}.db`;

export const db = new Sequelize({
  dialect: "sqlite",
  storage,
  pool: { max: 1, maxUses: Infinity, idle: Infinity },
});

export async function atomic<T>(
  operation: string,
  dbOps: (transaction: Transaction) => Promise<T>
): Promise<T> {
  const t = await db.transaction();

  try {
    const res = await dbOps(t);
    await t.commit();

    console.log(`\n\t${operation || "Transaction"} succeeded!\n`);
    return res;
  } catch (err) {
    await t.rollback();

    console.error(
      `\n\t${operation || "Transaction"} failed:`,
      (err as Error).message,
      "\n"
    );
    throw err;
  }
}

const raw = new sqlite3.Database(storage, OPEN_CREATE | OPEN_READWRITE);

export const closeDB = () => raw.close();

const getRawSqlClient = () => ({
  query: (sql: string, values?: unknown[]) =>
    new Promise<unknown[]>((resolve, reject) => {
      raw.all(sql, values, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

  exec: (sql: string) =>
    new Promise<void>((resolve, reject) => {
      raw.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }),
});

const RE_SPLITTER = /(.*)^-- DOWN --$(.*)/ms;

export const migrator = new Umzug({
  migrations: {
    glob: "migrations/*.sql",
    resolve({ name, path, context: client }) {
      const sql = fs.readFileSync(path!).toString();
      const parts = sql.match(RE_SPLITTER);

      if (!parts) throw new Error("missing separator '-- DOWN --'");

      const [, up, down] = parts;

      return {
        name,
        path,
        up: async () => await client.exec(up),
        down: async () => await client.exec(down),
      };
    },
  },
  context: getRawSqlClient(),
  storage: {
    async executed({ context: client }) {
      await client.query("CREATE TABLE IF NOT EXISTS migrations (name TEXT)");
      const results = await client.query("SELECT name FROM migrations");
      return (results as { name: string }[]).map((r) => r.name);
    },

    async logMigration({ name, context: client }) {
      await client.query("INSERT INTO migrations (name) VALUES (?)", [name]);
    },

    async unlogMigration({ name, context: client }) {
      await client.query("DELETE FROM migrations WHERE name = ?", [name]);
    },
  },
  logger: console,
  create: {
    folder: "migrations",
  },
});
