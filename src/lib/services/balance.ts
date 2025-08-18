import { sql } from "drizzle-orm";

import { db, TGroup } from "@/lib/db";

export async function getBalance(userId: number) {
  const data = await db.get<{ json: string } | null>(
    sql`WITH step1 AS (
      SELECT
        ms.group_id AS gid,
        g.name AS gName,
        paid_on AS "date",
        min(paid_by, paid_to) AS uid1,
        max(paid_by, paid_to) AS uid2,
        sum(share * CASE WHEN paid_by < paid_to THEN 1 ELSE -1 END) as share
      FROM memberships ms
      INNER JOIN consumption c ON ms.group_id = c.group_id
      INNER JOIN groups g ON c.group_id = g.id
      WHERE ms.user_id = ${userId} AND paid_by != paid_to
      GROUP BY ms.group_id, paid_on, paid_by, paid_to
      ORDER BY ms.group_id, "date"
    ),

    step2 AS (
      SELECT
        gid,
        gName,
        "date",
        concat(u1.name, ' vs ', u2.name) AS relation,
        sum(share) AS share
      FROM step1
      INNER JOIN users u1 ON u1.id = step1.uid1
      INNER JOIN users u2 on u2.id = step1.uid2
      GROUP BY gid, "date", relation
    ),

    step3 AS (
      SELECT
        gid,
        gName,
        "date",
        relation,
        sum(share) OVER (
          PARTITION BY gid, relation
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS share
      FROM step2
      GROUP BY gid, "date", relation
    ), 
    
    step4 AS (
      SELECT
        concat(
          '{ "id": ',
          json_quote(gid),

          ', "name": ',
          json_quote(gName),

          ', "balance": ',
          json_object(
            'relations',
            json_group_array(distinct relation),

            'data',
            json_group_array(json_object('date', date, relation, round(share, 2)))
          ),
        
        ' }'
        ) AS "json"
      FROM step3
      GROUP BY gid
      ORDER BY gName
    )

    SELECT concat('[',  group_concat("json"), ']') AS "json"
    FROM step4`
  );

  return data ? (JSON.parse(data.json) as TGroup[]) : [];
}
