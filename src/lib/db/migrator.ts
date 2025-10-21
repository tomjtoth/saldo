import fs from "fs";

import { sql } from "drizzle-orm";

import { err } from "../utils";
import { db } from ".";

const TAB = "\t";
const LF = "\n\n";

const migrate = (direcionIsUp: boolean) => async () => {
  /**
   * simple wrapper around sql template strings with working syntax highlight (dependent on the "sql" name) in VS Code
   */
  const exec = {
    async sql(strings: TemplateStringsArray) {
      const query = strings.join(" ");
      await db.$client.executeMultiple(query);
    },
  };

  /**
   * same as `db.all(sql`statement`)`
   * simple wrapper around sql template strings with working syntax highlight (dependent on the "sql" name) in VS Code
   */
  const query = {
    async sql(strings: TemplateStringsArray, ...values: unknown[]) {
      const query = sql(strings, ...values);
      return await db.all(query);
    },
  };

  const migrationsDir = "migrations";

  await exec.sql`
      CREATE TABLE IF NOT EXISTS "metadata" (
        "id" INTEGER PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "payload" BLOB
      );
    `;

  const separateMigrationsTableExists =
    (
      await query.sql`
          SELECT 1 FROM sqlite_master 
          WHERE tbl_name = 'migrations';
        `
    ).length > 0;

  if (separateMigrationsTableExists)
    await exec.sql`
        INSERT INTO "metadata" ("name", "payload")
        SELECT 'migrations', json_group_array("name")
        FROM "migrations" ORDER BY "name";

        DROP TABLE "migrations";
      `;

  const done = (
    await query.sql`
        SELECT "value" FROM "metadata", json_each("payload")
        WHERE "name" = 'migrations';
      `
  ).map((x) => (x as { value: string }).value);

  const migrations = fs
    .readdirSync(migrationsDir, { encoding: "utf-8" })
    .filter((file) => file.endsWith(".sql") && !done.includes(file));

  const res: string[] = [];

  const splitter = /(.+)^--\s*DOWN\s*--$(.*)/ms;

  try {
    for (const migName of migrations) {
      const script = fs.readFileSync(`${migrationsDir}/${migName}`, {
        encoding: "utf-8",
      });

      const split = script.match(splitter);
      if (!split) err("missing DOWN part of migration");

      const [, up, down] = split;

      await exec.sql`PRAGMA foreign_keys = OFF`;
      const tx = await db.$client.transaction();

      try {
        await tx.executeMultiple(direcionIsUp ? up : down);

        const violations = await tx.execute("PRAGMA foreign_key_check");
        const len = violations.rows.length;

        if (len > 0)
          err(
            `${len} foreign_key violations occured during "${migName}":\n\n${JSON.stringify(
              violations.rows,
              null,
              "\t"
            )}\n`
          );

        await tx.commit();

        await query.sql`
            INSERT INTO "metadata" ("name", "payload") VALUES ('migrations', json_array(${migName}))
            ON CONFLICT DO UPDATE SET "payload" = json_insert("payload", '$[#]', ${migName});
          `;
      } catch (err) {
        await tx.rollback();
        throw err;
      } finally {
        await exec.sql`PRAGMA foreign_keys = ON`;
      }

      res.push(migName);
    }
  } catch (err) {
    console.error(LF, TAB, "Migration failed:", LF, (err as Error).message, LF);
    process.exit(1);
  } finally {
    await exec.sql`VACUUM`;
  }

  const len = res.length;

  if (len > 0) {
    console.log(
      LF,
      TAB,
      `${len > 1 ? `${len} migrations` : `Migration "${res[0]}"`} succeeded.`,
      LF
    );
  }
};

export const migrator = {
  up: migrate(true),
  down: migrate(false),
};
