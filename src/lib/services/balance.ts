import { QueryTypes } from "sequelize";

import { db, TGroup } from "@/lib/models";
import { TBalanceChartData } from "@/components/balance/chart";

export async function getBalance(userId: number) {
  const rows: // silencing TS, selecting only id and name from group...
  (Omit<TGroup, "balance"> & {
    balance: string;
  })[] = await db.query(
    `WITH step1 AS (
      SELECT
        groupId AS gid,
        g.name AS gName,
        paidOn AS date,
        MIN(paidBy, paidTo) AS uid1,
        MAX(paidBy, paidTo) AS uid2,
        SUM(share * CASE WHEN paidBy < paidTo THEN 1 ELSE -1 END) as share
      FROM memberships ms
      INNER JOIN consumption c ON ms.group_id = c.groupId
      INNER JOIN groups g ON groupId = g.id
      WHERE ms.user_id = ? AND paidBy != paidTo
      GROUP BY groupId, paidOn, paidBy, paidTo
      ORDER BY groupId, date
    ),

    step2 AS (
      SELECT
        gid,
        gName,
        date,
        CONCAT(u1.name, ' vs ', u2.name) AS relation,
        SUM(share) AS share
      FROM step1
      INNER JOIN users u1 ON u1.id = step1.uid1
      INNER JOIN users u2 on u2.id = step1.uid2
      GROUP BY gid, date, relation
    ),

    step3 AS (
      SELECT
        gid,
        gName,
        date,
        relation,
        SUM(share) OVER (
          PARTITION BY gid, relation
          ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS share
      FROM step2
      GROUP BY gid, date, relation
    )

    SELECT
    	gid AS id,
      gName AS name,
      JSON_OBJECT(
        'relations',
        JSON_GROUP_ARRAY(distinct relation),

        'data',
        JSON_GROUP_ARRAY(JSON_OBJECT('date', date, relation, share))
      ) AS balance
    FROM step3
    GROUP BY gid`,

    { type: QueryTypes.SELECT, replacements: [userId], nest: true }
  );

  return rows.map(({ balance, ...group }) => ({
    ...group,
    balance: JSON.parse(balance) as TBalanceChartData,
  })) as TGroup[];
}
