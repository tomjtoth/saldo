import fs from "fs";

import { sql } from "drizzle-orm";

import { err } from "../utils";
import { ddb as db } from ".";

export const migrator = {
  up: async () => {
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
      CREATE TABLE IF NOT EXISTS "meta" (
        "id" INTEGER PRIMARY KEY,
        "info" TEXT NOT NULL UNIQUE,
        "data" BLOB
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
        INSERT INTO "meta" ("info", "data")
        SELECT 'migrations', json_group_array("name")
        FROM "migrations" ORDER BY "name";

        DROP TABLE "migrations";
      `;

    const done = (
      await query.sql`
        SELECT value FROM meta, json_each(data)
        WHERE info = 'migrations';
      `
    ).map((x) => (x as { value: string }).value);

    const migrations = fs
      .readdirSync(migrationsDir, { encoding: "utf-8" })
      .filter((file) => file.endsWith(".sql") && !done.includes(file));

    const res: string[] = [];

    try {
      for (const migName of migrations) {
        const script = fs.readFileSync(`${migrationsDir}/${migName}`, {
          encoding: "utf-8",
        });

        await exec.sql`PRAGMA foreign_keys = OFF`;
        const tx = await db.$client.transaction();

        try {
          await tx.executeMultiple(script);

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
            INSERT INTO meta (info, data) VALUES ('migrations', json_array(${migName}))
            ON CONFLICT DO UPDATE SET data = json_insert(data, '$[#]', ${migName});
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
      throw err;
    } finally {
      await exec.sql`VACUUM`;
    }

    return res;
  },
};
