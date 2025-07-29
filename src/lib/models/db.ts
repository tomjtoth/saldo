import fs from "fs";

import { Sequelize, Transaction } from "sequelize";
import { Database, OPEN_CREATE, OPEN_READWRITE } from "sqlite3";

import { err } from "../utils";

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

export const migrator = {
  up: async () => {
    const db = new Database(storage, OPEN_CREATE | OPEN_READWRITE);

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
      payload BLOB
    );`);

    const separateMigrationsTableExists =
      (await query("SELECT 1 FROM sqlite_master WHERE tbl_name = 'migrations'"))
        .length > 0;

    if (separateMigrationsTableExists) {
      await exec(`
        INSERT INTO meta (info, payload)
        SELECT 'migrations', jsonb_group_array(name)
        FROM migrations ORDER BY name;

        DROP TABLE migrations;
      `);
    }

    const done = (await query(
      "SELECT value FROM meta, json_each(payload) WHERE info = 'migrations'"
    )) as string[];

    const splitter = /(.+)^--\s*DOWN\s*--$(.*)/ms;

    const res = fs
      .readdirSync("migrations")
      .filter((file) => file.endsWith(".sql") && !done.includes(file))
      .map(async (migTodo) => {
        const mig = fs.readFileSync(`migrations/${migTodo}`, {
          encoding: "utf-8",
        });

        const split = mig.match(splitter);

        if (!split) err(`missing '^-- DOWN --$' line in "${migTodo}"`);

        const [, up] = split;

        await exec(up);

        await query(
          `INSERT INTO meta (info, payload) VALUES ('migrations', jsonb_array(:migTodo))
            ON CONFLICT DO UPDATE SET payload = jsonb_insert(payload, '$[#]', :migTodo)`,
          [{ migTodo }]
        );

        return migTodo;
      });

    await exec("VACUUM");
    db.close();

    return res;
  },
};
