import fs from "fs";

import { Sequelize, Transaction } from "sequelize";
import { Umzug } from "umzug";

export const db = new Sequelize({
  dialect: "sqlite",
  storage:
    process.env.NODE_ENV === "test"
      ? ":memory:"
      : process.env.DB_PATH ||
        `data/${process.env.NODE_ENV === "production" ? "prod" : "dev"}.db`,
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

    console.error(`\n\t${operation || "Transaction"} failed:`, err, "\n");
    throw err;
  }
}

const getRawSqlClient = () => ({
  query: async (sql: string, values?: unknown[]) =>
    db.query(sql, { bind: values }),
});

const RE_SINGLE_STMT =
  /^(?:(?:CREATE|ALTER|DROP) TABLE|INSERT|DELETE|UPDATE).+?;/gims;

export const migrator = new Umzug({
  migrations: {
    glob: "migrations/*.sql",
    resolve(params) {
      const sql = fs.readFileSync(params.path!).toString();
      const separator = sql.indexOf("-- DOWN --");

      const exec = async (script: string) =>
        Promise.all(
          script
            .matchAll(RE_SINGLE_STMT)
            .map(async (m) => await params.context.query(m[0]))
        );

      return {
        name: params.name,
        path: params.path,
        up: async () => await exec(sql.slice(0, separator)),
        down: async () => await exec(sql.slice(separator)),
      };
    },
  },
  context: getRawSqlClient(),
  storage: {
    async executed({ context: client }) {
      await client.query(`CREATE TABLE IF NOT EXISTS migrations (name TEXT)`);
      const [results] = await client.query(`SELECT name FROM migrations`);
      return (results as { name: string }[]).map((r) => r.name);
    },

    async logMigration({ name, context: client }) {
      await client.query(`INSERT INTO migrations (name) VALUES ($1)`, [name]);
    },

    async unlogMigration({ name, context: client }) {
      await client.query(`DELETE FROM migrations WHERE name = $1`, [name]);
    },
  },
  logger: console,
  create: {
    folder: "migrations",
  },
});
