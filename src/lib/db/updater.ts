import { sql } from "drizzle-orm";
import { DrizzleTx } from ".";

export async function updater<T extends { revisionId: number }>(
  original: T,
  modifier: Partial<Omit<T, "revisionId">>,
  {
    tx,
    tableName,
    revisionId,
    entityPk1,
    entityPk2,
    skipArchivalOf = [],
  }: {
    tx: DrizzleTx;
    tableName: string;
    revisionId: number;
    entityPk1: number;
    entityPk2?: number;
    skipArchivalOf?: (keyof T)[];
  }
) {
  let saving = false;
  const archive: Partial<T> = {};

  for (const key in modifier) {
    const typedKey = key as keyof typeof modifier;
    const val = modifier[typedKey];

    if (val !== undefined && val !== original[typedKey]) {
      if (!skipArchivalOf.includes(typedKey))
        archive[typedKey] = original[typedKey];

      original[typedKey] = val;
      saving = true;
    }
  }

  const entries = Object.entries(archive);
  const createArchive = entries.length > 0;

  if (createArchive) {
    const tableColumnIds = await tx.all<{ columnName: string; id: bigint }>(
      sql`SELECT id, columnName FROM tableColumnNames WHERE tableName = ${tableName};`
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
        INSERT INTO "metadata" (name, payload) SELECT 'tableColumnIds', json_array(${insertArgs.join(
          ", "
        )})
        ON CONFLICT DO UPDATE SET payload = json_insert(payload, ${updateArgs.join(
          ", "
        )}) 
        WHERE name = "tableColumnIds" RETURNING json_array_length(payload) - 1 AS lastId
      `;

      const [{ lastId }] = await tx.all<{
        lastId: bigint;
      }>(query);

      colNamesToInsert.forEach(([col], idx) => {
        tciAccessor[col] = lastId - BigInt(idx);
      });
    }

    const values = entries.map(([col, val]) =>
      sql.raw(`(
        ${tciAccessor[col]},
        ${entityPk1},
        ${entityPk2 ?? null},
        ${original.revisionId},
        ${val}
      )`)
    );

    await tx.run(sql`
      INSERT INTO "archives" ("table_column_id", "entity_pk1", "entity_pk2", "revision_id", "payload")
      VALUES ${sql.join(values)}
    `);

    original.revisionId = revisionId!;
  }

  return saving;
}
