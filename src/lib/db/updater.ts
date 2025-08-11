import { Prisma } from "@prisma/client";
import { PrismaTx } from "./atomic";

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
    tx: PrismaTx;
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
    const tableColumnIds = (await tx.$queryRaw(
      Prisma.sql`SELECT id, columnName FROM tableColumnNames WHERE tableName = ${tableName};`
    )) as { id: bigint; columnName: string }[];

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

      const sql = `
        INSERT INTO "Meta" (info, data) SELECT 'tableColumnIds', json_array(${insertArgs.join(
          ", "
        )})
        ON CONFLICT DO UPDATE SET data = json_insert(data, ${updateArgs.join(
          ", "
        )}) 
        WHERE info = "tableColumnIds" RETURNING json_array_length(data) - 1 AS lastId
      `;

      const [{ lastId }] = (await tx.$queryRawUnsafe(sql)) as {
        lastId: bigint;
      }[];

      colNamesToInsert.forEach(([col], idx) => {
        tciAccessor[col] = lastId - BigInt(idx);
      });
    }

    const values = entries.map(
      ([col, val]) => Prisma.sql`(
        ${tciAccessor[col]},
        ${entityPk1},
        ${entityPk2 ?? null},
        ${original.revisionId},
        ${val}
      )`
    );

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "Archive" ("tableColumnId", "entityPk1", "entityPk2", "revisionId", "data")
      VALUES ${Prisma.join(values)}
    `);

    original.revisionId = revisionId!;
  }

  return saving;
}
