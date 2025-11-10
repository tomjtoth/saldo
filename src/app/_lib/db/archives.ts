import { sql } from "drizzle-orm";

import { VDate } from "../utils";
import { db } from "./instance";
import { DrizzleTx, SchemaTables } from "./types";

export async function getArchivePopulator<T extends { archives?: T[] }>(
  tableName: keyof SchemaTables,
  pk1: keyof T,
  {
    pk2,
    tx,
  }: {
    pk2?: keyof T;
    tx?: DrizzleTx;
  } = {}
) {
  const query = {
    async sql<T>(
      strings: TemplateStringsArray,
      ...args: (string | number | null)[]
    ) {
      const res: T = await (tx ?? db).get(sql(strings, ...args));

      return res;
    },
  };

  const res: { payload: string } = await query.sql`
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
  `;

  const archives: {
    [pk1: string]: {
      [pk2: string]: {
        revisionId: number;
        revision: {
          createdAt: number | string;
          createdBy: { name: string; image: string | null };
        };
      } & {
        [columns: Exclude<string, "revision" | "revisionId">]:
          | number
          | string
          | null;
      }[];
    };
  } = JSON.parse(res.payload);

  return function populate(arr: T[]) {
    arr.forEach((entity) => {
      const strPk1 = (entity[pk1 as keyof T] as number).toString();
      const strPk2 = pk2
        ? (entity[pk2 as keyof T] as number).toString()
        : "null";

      const restoredArchiveRows: T[] = [];

      if (archives[strPk1]) {
        archives[strPk1][strPk2].reduce((prev, rev) => {
          const curr = { ...prev, ...rev } as T;

          const dateTimeConverter = curr as {
            revision?: { createdAt: number | string };
          };

          dateTimeConverter.revision!.createdAt = VDate.timeToStr(
            dateTimeConverter.revision!.createdAt as number
          );

          restoredArchiveRows.push(curr);

          return curr;
        }, entity as T);
      }

      entity.archives = restoredArchiveRows;
    });
  };
}
