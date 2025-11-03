"use server";

import { sql } from "drizzle-orm";

import { db, groupsWithUsersCTE, TGroup } from "@/app/_lib/db";

export async function getBalance(userId: number) {
  const data = await db.get<{ json: string } | null>(
    sql`WITH ${groupsWithUsersCTE(userId)},
    
    normalized_shares_and_uids AS (
      SELECT
        gid,
        paid_on AS "date",
        min(paid_by, paid_to) AS uid1,
        max(paid_by, paid_to) AS uid2,
        sum(share * iif(paid_by < paid_to, 1, -1)) as share
      FROM groups_with_users gwu
      LEFT JOIN consumption c ON gwu.gid = c.group_id
      WHERE paid_by != paid_to
      GROUP BY gid, paid_on, paid_by, paid_to
      ORDER BY gid, "date"
    ),

    relations_and_daily_sums AS (
      SELECT
        gid,
        "date",
        concat(uid1, ' vs ', uid2) AS relation,
        sum(share) AS share
      FROM normalized_shares_and_uids
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
        gwu.gid,
   
        jsonb_object(
          'id', gwu.gid,
          'name', gwu.name,

          'balance', jsonb_object(
            'relations', relations,
            'users', gwu.users,
            'data', jsonb_group_array(daily_data)
          )
        ) as "group"
      FROM groups_with_users gwu
      LEFT JOIN data_by_date dbd ON gwu.gid = dbd.gid
      LEFT JOIN distinct_relations dr ON gwu.gid = dr.gid
      GROUP BY gwu.gid
      ORDER BY gwu.name, "date"
    )

    -- debug during development
    -- SELECT * from group_per_row

    SELECT json(jsonb_group_array("group")) AS "json"
    FROM group_per_row`
  );

  return data ? (JSON.parse(data.json) as TGroup[]) : [];
}
