import { DateTime } from "luxon";
import { QueryTypes } from "sequelize";

import { db, TGroup } from "../models";
import { dateToInt, EUROPE_HELSINKI } from "../utils";
import { TParetoChartData } from "@/components/pareto/chart";

export async function getPareto(
  userId: number,
  opts: {
    from?: string;
    to?: string;
  } = {}
) {
  const dateCrit: string[] = [];
  const replacements = [userId];

  if (opts.from && DateTime.fromISO(opts.from, EUROPE_HELSINKI).isValid) {
    replacements.push(dateToInt(opts.from));
    dateCrit.push("AND paidOn > ?");
  }

  if (opts.to && DateTime.fromISO(opts.to, EUROPE_HELSINKI).isValid) {
    replacements.push(dateToInt(opts.to));
    dateCrit.push("AND paidOn < ?");
  }

  const rows: (Omit<TGroup, "pareto"> & {
    users: string;
    categories: string;
  })[] = await db.query(
    `WITH step1 AS (
      SELECT
        groupId AS gid,
        g.name AS gName,
        cats.name AS cat,
        u.name AS user,
        SUM(share) AS total
      FROM memberships ms
      INNER JOIN consumption con ON ms.group_id = con.groupId
      INNER JOIN categories cats ON con.catId = cats.id
      INNER JOIN users u ON u.id = con.paidTo
      INNER JOIN groups g ON g.id = con.groupId
      WHERE ms.user_id = ? ${dateCrit.join(" ")}
      GROUP BY groupId, paidTo, catId
    ),

    step2 AS (
      SELECT
        gid,
        gName,
        SUM(total) AS orderer,
        JSON_INSERT(
          JSON_GROUP_OBJECT(user, total),
          '$.category', cat
        ) AS cats
      FROM step1
      GROUP BY gid, cat
      ORDER BY orderer DESC
    ),

    step3 AS (
      SELECT
        gid,
        gName,
        JSON_GROUP_ARRAY(cats) AS categories
      FROM step2
    )

    SELECT
      s3.gid AS id,
      s3.gName AS name,
      JSON_GROUP_ARRAY(DISTINCT s1.user) AS users,
      categories
    FROM step3 s3
    LEFT JOIN step1 s1 ON s1.gid = s3.gid
    GROUP BY s3.gid`,

    { type: QueryTypes.SELECT, replacements }
  );

  return rows.map(({ users, categories, ...group }) => {
    return {
      ...group,
      pareto: {
        users: JSON.parse(users) as string[],
        categories: (JSON.parse(categories) as string[]).map((strObj) =>
          JSON.parse(strObj)
        ),
      } as unknown as TParetoChartData,
    };
  }) as TGroup[];
}
