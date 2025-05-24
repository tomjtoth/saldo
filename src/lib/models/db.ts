import fs from "fs";

import { Sequelize } from "sequelize";
import { Umzug } from "umzug";

import { DB_PATH } from "@/lib/utils/config";

export const db = new Sequelize({
  dialect: "sqlite",
  storage: DB_PATH,
  pool: { max: 1, maxUses: Infinity, idle: Infinity },
});

const getRawSqlClient = () => ({
  query: async (sql: string, values?: unknown[]) =>
    db.query(sql, { bind: values }),
});

const RE_SINGLE_STMT =
  /^(?:(?:CREATE|ALTER|DROP) TABLE|INSERT|DELETE|UPDATE).+?;/gims;

const migrator = new Umzug({
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

// export type Migration = typeof migrator._types.migration;

let needsMigrate = true;

if (needsMigrate) {
  needsMigrate = false;
  console.log("\n\tDB migration triggered\n");
  await migrator.up();
}
