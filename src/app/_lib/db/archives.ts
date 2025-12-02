import { sql } from "drizzle-orm";

import { VDate } from "../utils";
import { db } from "./instance";
import { DbSelect, DrizzleTx, RevisionInfo, SchemaTables } from "./types";

type ArchivedTables = Exclude<
  keyof SchemaTables,
  "metadata" | "archives" | "chartColors" | "revisions"
>;

export type ArchivePopulatorFn = Awaited<
  ReturnType<typeof getArchivePopulator>
>;

export async function getArchivePopulator(tx?: DrizzleTx) {
  const res: { payload: string } = await (tx ?? db).get(sql`
    WITH by_changes AS (
      SELECT
        names.table_name AS tbl,
        entity_pk1 AS pk1,
        entity_pk2 AS pk2,
        a.revision_id,

        jsonb_insert(
          jsonb_group_object(names.column_name, payload),

          '$.revisionId', a.revision_id,
          '$.revision', jsonb_object(
            'createdAt', r.created_at,
            'createdById', r.created_by
          )
        ) AS payload
      FROM archives a
      INNER JOIN table_column_names AS names
        ON a.table_column_id = names.id
      INNER JOIN revisions r ON r.id = a.revision_id
      INNER JOIN users u ON u.id = r.created_by
      GROUP BY tbl, pk1, pk2, a.revision_id
      ORDER BY r.created_at DESC
    ),

    by_revisions AS (
      SELECT
        tbl,
        pk1,
        pk2,
        jsonb_group_array(payload) AS payload
      FROM by_changes
      GROUP BY tbl, pk1, pk2
    ),

    by_pk2 AS (
      SELECT
        tbl,
        pk1,
        jsonb_group_object(
          coalesce(cast(pk2 AS TEXT), 'null'),
          payload
        ) AS payload
      FROM by_revisions
      GROUP BY tbl, pk1
    ),

    by_pk1 AS (
      SELECT
        tbl,
        jsonb_group_object(
          cast(pk1 AS TEXT),
          payload
        ) AS payload
      FROM by_pk2
      GROUP BY tbl
    ),

    by_tbl AS (
      SELECT 
        json_group_object(
          tbl,
          payload
        ) AS payload
      FROM by_pk1
    )

    SELECT * FROM by_tbl
  `);

  const buffer: {
    [T in ArchivedTables]?: {
      [pk1: string]: {
        [pk2: string]: (object & RevisionInfo)[];
      };
    };
  } = JSON.parse(res.payload);

  return function populator<
    Table extends ArchivedTables,
    Entity extends DbSelect<Table>,
    PE extends Partial<Entity>
  >(
    origin:
      | Table
      | { table: Table; primaryKeys: { [PK in keyof Entity]?: true } },
    entities: PE[]
  ): (PE & { archives: (Entity & RevisionInfo)[] })[] {
    const { table, primaryKeys = { id: true } } =
      typeof origin === "string" ? { table: origin } : origin;

    const [pk1, pk2] = Object.keys(primaryKeys) as [
      keyof PE,
      keyof PE | undefined
    ];

    return entities.map((entity) => {
      const strPk1 = (entity[pk1] as number).toString();
      const strPk2 = pk2 ? (entity[pk2] as number).toString() : "null";

      const archives: (Entity & RevisionInfo)[] = [];

      if (buffer[table] && buffer[table][strPk1]) {
        buffer[table][strPk1][strPk2].reduce((prev, rev) => {
          const curr = { ...prev, ...rev };

          const dateTimeConverter: {
            revision: { createdAt: number | string };
          } = curr;

          dateTimeConverter.revision.createdAt = VDate.timeToStr(
            dateTimeConverter.revision.createdAt as number
          );

          archives.push(curr);

          return curr;
        }, entity as unknown as Entity);
      }

      return { ...entity, archives };
    });
  };
}
