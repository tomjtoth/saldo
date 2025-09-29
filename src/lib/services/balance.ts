import { sql } from "drizzle-orm";

import { db, TGroup } from "@/lib/db";

export async function getBalance(userId: number) {
  const data = await db.get<{ json: string } | null>(
    sql`WITH normalized_shares_and_uids AS (
      SELECT
        ms.group_id AS gid,
        paid_on AS "date",
        min(paid_by, paid_to) AS uid1,
        max(paid_by, paid_to) AS uid2,
        sum(share * CASE WHEN paid_by < paid_to THEN 1 ELSE -1 END) as share
      FROM memberships ms
      INNER JOIN consumption c ON ms.group_id = c.group_id
      WHERE ms.user_id = ${userId} AND paid_by != paid_to
      GROUP BY gid, paid_on, paid_by, paid_to
      ORDER BY gid, "date"
    ),

    distinct_uids AS (
      SELECT DISTINCT gid, uid1 AS "uidx"
      FROM normalized_shares_and_uids
      UNION

      SELECT DISTINCT gid, uid2 AS "uidx"
      FROM normalized_shares_and_uids
    ),

    distinct_users_data AS (
      SELECT
        gid,
        json_group_array(
          json_object(
            'id', "uidx",
            'name', u.name,
            'chartStyle', coalesce(
              json_extract(ms.chart_style, concat('$.', "uidx")),
              u.chart_style
            )
          )
        ) AS "user_data"
      FROM distinct_uids
      INNER JOIN memberships ms ON ms.group_id = gid AND ms.user_id = ${userId}
      INNER JOIN users u ON "uidx" = u.id
      GROUP BY gid
    ),

    relations_and_daily_sums AS (
      SELECT
        gid,
        "date",
        concat(uid1, ' vs ', uid2) AS relation,
        sum(share) AS share
      FROM normalized_shares_and_uids nsu
      INNER JOIN users u1 ON u1.id = nsu.uid1
      INNER JOIN users u2 ON u2.id = nsu.uid2
      GROUP BY gid, "date", relation
    ),

    cumulated_daily_sums AS (
      SELECT
        gid,
        "date",
        relation,
        sum(share) OVER (
          PARTITION BY gid, relation
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS share
      FROM relations_and_daily_sums
      GROUP BY gid, "date", relation
    ),

    data_by_date AS (
      SELECT
        gid,
        "date",
        json_patch(
          json_object(
            'date', "date",
            'min', round(min(share), 2),
            'max', round(max(share), 2)
          ),

          json_group_object(relation, round(share, 2))
        ) AS daily_data
      FROM cumulated_daily_sums cds
      GROUP BY "gid", "date"
    ),

    data_by_date_and_gid AS (
      SELECT
        dbd.gid,
        json_insert(
          json_object(
            'id', dbd.gid,
            'name', g.name
          ),

          '$.balance.users',
          json_extract(user_data, '$'),

          '$.balance.data',
          json_group_array(json_extract(daily_data, '$'))

        ) as "json"
      FROM data_by_date dbd
      INNER JOIN groups g ON g.id = dbd.gid
      INNER JOIN distinct_users_data dud ON dud.gid = dbd.gid
      GROUP BY dbd.gid
      ORDER by g.name
    ),

    with_relations AS (
      SELECT 
        json_insert(
          "json",

          '$.balance.relations',
          json_group_array(distinct relation)
        ) AS "json"
      FROM data_by_date_and_gid dbd
      INNER JOIN relations_and_daily_sums rads ON rads.gid = dbd.gid
      GROUP BY dbd.gid
    )

    -- debug during development
    -- SELECT * from data_by_date_and_gid

    SELECT concat('[',  group_concat("json"), ']') AS "json"
    FROM with_relations`
  );

  return data ? (JSON.parse(data.json) as TGroup[]) : [];
}
