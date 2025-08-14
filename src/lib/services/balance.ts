import { sql } from "drizzle-orm";

import { db, TGroup } from "@/lib/db";

export async function getBalance(userId: number) {
  const data = await db.get<{ json: string } | null>(
    sql`
    WITH step1 AS (
      SELECT
        ms.groupId AS gid,
        g.name AS gName,
        paidOn AS date,
        min(paidBy, paidTo) AS uid1,
        max(paidBy, paidTo) AS uid2,
        sum(share * CASE WHEN paidBy < paidTo THEN 1 ELSE -1 END) as share
      FROM "Membership" ms
      INNER JOIN "consumption" c ON ms.groupId = c.groupId
      INNER JOIN "Group" g ON c.groupId = g.id
      WHERE ms.userId = ${userId} AND paidBy != paidTo
      GROUP BY ms.groupId, paidOn, paidBy, paidTo
      ORDER BY ms.groupId, date
    ),

    step2 AS (
      SELECT
        gid,
        gName,
        date,
        concat(u1.name, ' vs ', u2.name) AS relation,
        sum(share) AS share
      FROM step1
      INNER JOIN "User" u1 ON u1.id = step1.uid1
      INNER JOIN "User" u2 on u2.id = step1.uid2
      GROUP BY gid, date, relation
    ),

    step3 AS (
      SELECT
        gid,
        gName,
        date,
        relation,
        sum(share) OVER (
          PARTITION BY gid, relation
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS share
      FROM step2
      GROUP BY gid, date, relation
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
        ) AS json
      FROM step3
      GROUP BY gid
    )

    SELECT concat('[',  group_concat(json), ']') AS json
    FROM step4`
  );

  return data ? (JSON.parse(data.json) as TGroup[]) : [];
}
