import { sql } from "drizzle-orm";

export const balanceQuery = () =>
  sql<string>`(
    WITH normalized_shares_and_uids AS (
      SELECT
        paid_on AS "date",
        min(paid_by, paid_to) AS uid1,
        max(paid_by, paid_to) AS uid2,
        sum(share * iif(paid_by < paid_to, 1, -1)) as share
      FROM consumption c
      WHERE "groups"."id" = c.group_id AND paid_by != paid_to
      GROUP BY paid_on, paid_by, paid_to
      ORDER BY "date"
    ),

    relations_and_daily_sums AS (
      SELECT
        "date",
        concat(uid1, ' vs ', uid2) AS relation,
        sum(share) AS share
      FROM normalized_shares_and_uids
      GROUP BY "date", relation
    ),

    distinct_relations AS (
      SELECT jsonb_group_array(distinct relation) AS relations
      FROM relations_and_daily_sums
    ),

    cumulated_daily_sums AS (
      SELECT
        "date",
        relation,
        sum(share) OVER (
          PARTITION BY relation
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS share
      FROM relations_and_daily_sums
      GROUP BY "date", relation
    ),

    data_by_date AS (
      SELECT
        "date",
        jsonb_patch(
          jsonb_object('date', "date"),
          jsonb_group_object(relation, round(share, 2))
        ) AS daily_data
      FROM cumulated_daily_sums cds
      GROUP BY "date"
    )

    SELECT json_object(
      'relations', (SELECT relations FROM distinct_relations),
      'data', (SELECT jsonb_group_array("daily_data") FROM data_by_date)
    )
  )`;
