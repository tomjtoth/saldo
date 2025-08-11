import { DateTime } from "luxon";

import { db, TGroup } from "@/lib/db";
import { dateToInt, EUROPE_HELSINKI } from "../utils";

export async function getPareto(
  userId: number,
  opts: {
    from?: string;
    to?: string;
  } = {}
) {
  const from =
    opts.from &&
    // SQL injection prevented here
    DateTime.fromISO(opts.from, EUROPE_HELSINKI).isValid
      ? `AND paidOn > ${dateToInt(opts.from)}`
      : "";

  const to =
    opts.to &&
    // SQL injection prevented here
    DateTime.fromISO(opts.to, EUROPE_HELSINKI).isValid
      ? `AND paidOn < ${dateToInt(opts.to)}`
      : "";

  const rows: { json: string }[] = await db.$queryRawUnsafe(
    `WITH sums_per_row AS (
      SELECT
        g.id AS gid,
        g.name AS gName,
        cats.name AS cat,
        u.name AS user,
        sum(share) AS total
      FROM "Membership" ms
      INNER JOIN consumption con ON ms.groupId = con.groupId
      INNER JOIN "Category" cats ON con.categoryId = cats.id
      INNER JOIN "User" u ON u.id = con.paidTo
      INNER JOIN "Group" g ON g.id = con.groupId
      WHERE ms.userId = ${userId} ${from} ${to}
      GROUP BY g.id, paidTo, categoryId
    ),

    one_category_per_row AS (
      SELECT
        gid,
        gName,
        sum(total) AS orderer,
        json_insert(
          json_group_object(user, total),
          '$.category', cat
        ) AS cats
      FROM sums_per_row
      GROUP BY gid, cat
      ORDER BY orderer DESC
    ),

    categories_in_array_per_row AS (
      SELECT
        gid,
        gName,
        concat(
          '[',
          group_concat(cats),
          ']'
        ) AS categories
      FROM one_category_per_row
      GROUP BY gid
    ),

    one_group_per_row AS (
      SELECT
        concat('{ ',
          '"id": ',
          s3.gid,
          ', "name": ',
          json_quote(s3.gName),
          ', "pareto": { ',
            ' "users": ',
            json_group_array(DISTINCT s1.user),
            ', "categories": ',
            categories,
          ' }}'
        ) AS json
      FROM categories_in_array_per_row s3
      LEFT JOIN sums_per_row s1 ON s1.gid = s3.gid
      GROUP BY s3.gid
    )

    -- all groups in 1 array
    SELECT concat(
      '[', 
      group_concat(json),
      ']'
    ) AS json
    FROM one_group_per_row;`
  );

  return rows.length > 0 ? (JSON.parse(rows[0].json) as TGroup[]) : [];
}
