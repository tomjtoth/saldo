import { db } from "../db";
import { TBalanceChartData } from "@/components/balance/chart";
import { TGroup } from "../models";

export async function getBalance(userId: number) {
  const rows = db
    .prepare(
      `WITH step1 AS (
      SELECT
        g.id AS gid,
        g.name AS gName,
        paidOn AS date,
        MIN(paidBy, paidTo) AS uid1,
        MAX(paidBy, paidTo) AS uid2,
        SUM(share * CASE WHEN paidBy < paidTo THEN 1 ELSE -1 END) as share
      FROM memberships ms
      INNER JOIN consumption c ON ms.groupId = c.groupId
      INNER JOIN groups g ON groupId = g.id
      WHERE ms.userId = @userId AND paidBy != paidTo
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
    	gid AS groupId,
      gName AS name,
      JSON_OBJECT(
        'relations',
        JSON_GROUP_ARRAY(distinct relation), 
        
        'data', 
        JSON_GROUP_ARRAY(JSON_OBJECT('date', date, relation, share))
      ) AS balance
    FROM step3
    GROUP BY gid`
    )
    .all({
      userId,
    });

  return (
    rows as (Omit<TGroup, "balance"> & { // silencing TS, I'm only selecting id and name from TGroup...
      balance: string;
    })[]
  ).map(({ balance, ...group }) => ({
    ...group,
    balance: JSON.parse(balance) as TBalanceChartData,
  })) as TGroup[];
}
