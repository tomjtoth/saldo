import { and, eq, sql } from "drizzle-orm";

import { err, is } from "../utils";
import { DrizzleTx, SchemaTables } from "./types";
import * as schema from "./schema";

type EntityBase = { revisionId: number };

interface BaseOpts<E, T> {
  tx: DrizzleTx;
  tableName: T;
  revisionId: number;
  primaryKeys: { [PK in keyof E]?: true };
  skipArchivalOf?: { [SA in keyof E]?: true };
  unchangedThrows?: false;
}

export async function modEntity<
  E extends EntityBase,
  T extends keyof SchemaTables,
  M extends Partial<E>
>(
  entity: E,
  modifier: M,
  opts: BaseOpts<E, T> & {
    needsToReturn: true;
  }
): Promise<E>;

export async function modEntity<
  E extends EntityBase,
  T extends keyof SchemaTables,
  M extends Partial<E>
>(entity: E, modifier: M, opts: BaseOpts<E, T>): Promise<number>;

export async function modEntity<
  E extends EntityBase,
  T extends keyof SchemaTables,
  M extends Partial<E>
>(
  entity: E,
  modifier: M,
  {
    tx,
    tableName,
    revisionId,
    primaryKeys,
    skipArchivalOf = {},
    unchangedThrows,
    needsToReturn,
  }: BaseOpts<E, T> & {
    needsToReturn?: true;
  }
) {
  const [entityPk1, entityPk2] = Object.keys(primaryKeys) as [
    keyof E,
    keyof E | undefined
  ];
  let changes = 0;
  const archive: Partial<E> = {};

  for (const strKey in modifier) {
    if (strKey === "revisionId") continue;

    const key = strKey as keyof E;
    const val = modifier[key as keyof M];

    if (val !== undefined && val !== entity[key]) {
      if (key === "name") is.stringWith3ConsecutiveLetters(val as string);

      if (!(key in skipArchivalOf)) archive[key] = entity[key];

      entity[key] = val as (typeof entity)[typeof key];
      changes++;
    }
  }

  const entries = Object.entries(archive);
  const createArchive = entries.length > 0;

  if (createArchive) {
    const tableColumnIds = await tx.all<{ columnName: string; id: number }>(
      sql`SELECT id, column_name AS columnName FROM table_column_names WHERE table_name = ${tableName};`
    );

    const tciAccessor = Object.fromEntries(
      tableColumnIds.map(({ columnName, id }) => [columnName, id])
    );

    const colNamesToInsert = entries.filter(([col]) => !(col in tciAccessor));

    if (colNamesToInsert.length > 0) {
      const insertArgs: string[] = [];
      const updateArgs: string[] = [];

      for (const [col] of colNamesToInsert) {
        const prefixed = `'${tableName}.${col}'`;

        insertArgs.push(prefixed);
        updateArgs.push(`'$[#]', ${prefixed}`);
      }

      const query = `
        INSERT INTO "metadata" (name, payload) SELECT 'table_column_ids', json_array(${insertArgs.join(
          ", "
        )})
        ON CONFLICT DO UPDATE SET payload = json_insert(payload, ${updateArgs.join(
          ", "
        )})
        WHERE name = 'table_column_ids' RETURNING json_array_length(payload) - 1 AS lastId
      `;

      const [{ lastId }] = await tx.all<{
        lastId: number;
      }>(query);

      colNamesToInsert.forEach(([col], idx) => {
        tciAccessor[col] = lastId - idx;
      });
    }

    const values = entries.map(
      ([col, val]) =>
        sql`(
          ${tciAccessor[col]},
          ${entity[entityPk1]},
          ${entityPk2 ? entity[entityPk2] : null},
          ${entity.revisionId},
          ${val}
        )`
    );

    await tx.run(sql`
      INSERT INTO "archives" ("table_column_id", "entity_pk1", "entity_pk2", "revision_id", "payload")
      VALUES ${sql.join(values, sql`,`)}
    `);

    entity.revisionId = revisionId;
  }

  if (changes) {
    const table = schema[tableName];
    type Columns = (typeof table._)["columns"];

    // allow setting a subset of columns from the entity to satisfy Drizzle's expected shape
    type SetArg = Partial<{ [K in keyof Columns]: unknown }>;

    const conditions = and(
      ...[
        eq(table[entityPk1 as keyof Columns], entity[entityPk1]),
        ...(entityPk2
          ? [eq(table[entityPk2 as keyof Columns], entity[entityPk2])]
          : []),
      ]
    );

    const q = tx
      .update(table)
      .set(entity as SetArg)
      .where(conditions);

    if (needsToReturn) {
      const [res] = await q.returning();
      return res;
    } else {
      await q;
    }
  } else if (needsToReturn || (unchangedThrows ?? true)) {
    err("No changes were made");
  }

  return changes;
}
