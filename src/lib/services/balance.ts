import { sql } from "drizzle-orm";

import { db, distinctUsersData, TGroup } from "@/lib/db";

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
      SELECT DISTINCT gid, uid1 AS "uid"
      FROM normalized_shares_and_uids
      UNION

      SELECT DISTINCT gid, uid2 AS "uid"
      FROM normalized_shares_and_uids
    ),

    ${distinctUsersData(userId)},

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

    distinct_relations AS (
      SELECT gid, jsonb_group_array(distinct relation) AS relations
      FROM relations_and_daily_sums
      GROUP BY gid
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
        jsonb_patch(
          jsonb_object(
            'date', "date",
            'min', round(min(share), 2),
            'max', round(max(share), 2)
          ),

          jsonb_group_object(relation, round(share, 2))
        ) AS daily_data
      FROM cumulated_daily_sums cds
      GROUP BY "gid", "date"
    ),

    group_per_row AS (
      SELECT
        dbd.gid,
   
        jsonb_object(
          'id', dbd.gid,
          'name', g.name,

          'balance', jsonb_object(
            'relations', relations,
            'users', user_data,
            'data', jsonb_group_array(daily_data)
          )
        ) as "data"
      FROM data_by_date dbd
      INNER JOIN groups g ON g.id = dbd.gid
      INNER JOIN distinct_users_data dud ON dud.gid = dbd.gid
      INNER JOIN distinct_relations dr ON dr.gid = dbd.gid
      GROUP BY dbd.gid
      ORDER by g.name
    )

    -- debug during development
    -- SELECT * from group_per_row

    SELECT json(jsonb_group_array("data")) AS "json"
    FROM group_per_row`
  );

  return data ? (JSON.parse(data.json) as TGroup[]) : [];
}
