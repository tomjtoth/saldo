import { sql } from "drizzle-orm";

import { VDate } from "../utils";
import { db } from "./instance";
import { DrizzleTx, RevisionInfo, SchemaTables } from "./types";
import * as schema from "./schema";

export async function getArchivePopulator<
  Tbl extends keyof SchemaTables,
  Ent extends (typeof schema)[Tbl]["$inferSelect"]
>(
  tableName: Tbl,
  pk1: keyof Ent,
  {
    pk2,
    tx,
  }: {
    pk2?: keyof Ent;
    tx?: DrizzleTx;
  } = {}
) {
  const res: { payload: string } = await (tx ?? db).get(sql`
    WITH by_changes AS (
      SELECT
        entity_pk1 AS pk1,
        entity_pk2 AS pk2,
        a.revision_id,

        jsonb_insert(
          jsonb_group_object(names.column_name, payload),

          '$.revision', jsonb_object(
            'createdAt', r.created_at,
            'createdBy', jsonb_object(
              'id', u.id,
              'name', u.name,
              'image', u.image
            )
          ),
          '$.revisionId', a.revision_id
        ) AS payload
      FROM archives a
      INNER JOIN table_column_names AS names
        ON a.table_column_id = names.id
        AND names.table_name = ${tableName}
      INNER JOIN revisions r ON r.id = a.revision_id
      INNER JOIN users u ON u.id = r.created_by
      GROUP BY pk1, pk2, a.revision_id
      ORDER BY r.created_at DESC
    ),

    by_revisions AS (
      SELECT
        pk1,
        pk2,
        jsonb_group_array(payload) AS payload
      FROM by_changes
      GROUP BY pk1, pk2
    ),

    by_pk2 AS (
      SELECT
        pk1,
        jsonb_group_object(
          coalesce(cast(pk2 AS TEXT), 'null'),
          payload
        ) AS payload
      FROM by_revisions
      GROUP BY pk1
    ),

    by_pk1 AS (
      SELECT
        json_group_object(
          cast(pk1 AS TEXT),
          payload
        ) AS payload
      FROM by_pk2
    )

    SELECT * FROM by_pk1
  `);

  const buffer: {
    [pk1: string]: {
      [pk2: string]: (Partial<Ent> & RevisionInfo)[];
    };
  } = JSON.parse(res.payload);

  return function populate<C extends Partial<Ent>>(
    arr: C[]
  ): (C & { archives: (Ent & RevisionInfo)[] })[] {
    return arr.map((entity) => {
      const strPk1 = (entity[pk1] as number).toString();
      const strPk2 = pk2 ? (entity[pk2] as number).toString() : "null";

      const archives: (Ent & RevisionInfo)[] = [];

      if (buffer[strPk1]) {
        buffer[strPk1][strPk2].reduce((prev, rev) => {
          const curr = { ...prev, ...rev };

          const dateTimeConverter = curr as {
            revision?: { createdAt: number | string };
          };

          dateTimeConverter.revision!.createdAt = VDate.timeToStr(
            dateTimeConverter.revision!.createdAt as number
          );

          archives.push(curr);

          return curr;
        }, entity as unknown as Ent);
      }

      return { ...entity, archives };
    });
  };
}
