import { sql } from "drizzle-orm";

import { VDate } from "@/app/_lib/utils";

export type ConsumptionOpts = {
  from?: string;
  to?: string;
  jsonB?: true;
};

export const consumptionCTE = sql`(
  SELECT
    r.group_id,
    r.paid_on,
    r.paid_by,
    coalesce(sh.user_id, r.paid_by) AS paid_to,
    i.id AS item_id,
    i.category_id,
    cost / 100.0 * coalesce(share * 1.0 / sum(share) OVER (PARTITION BY i.id), 1) AS share
  FROM receipts r
  INNER JOIN items i ON r.id = i.receipt_id
  LEFT JOIN item_shares sh ON (sh.item_id = i.id AND sh.flags = 1)
  WHERE r.group_id = "d0"."id" -- "d0" is an alias for table groups
  AND r.flags = 1 AND i.flags = 1
  ORDER BY paid_on
)`;

export function consumptionQuery(opts?: ConsumptionOpts) {
  const crit: string[] = [];

  if (opts?.from) crit.push(`paid_on >= ${VDate.toInt(opts.from)}`);
  if (opts?.to) crit.push(`paid_on <= ${VDate.toInt(opts.to)}`);

  const whereClause = sql.raw(crit.length ? `WHERE ${crit.join(" AND ")}` : "");

  const groupingFn = sql.raw(`${opts?.jsonB ? "jsonb" : "json"}_group_array`);

  return sql<string>`(
    WITH sums_per_row AS (
      SELECT
        paid_to AS "uid",
        cat.id AS category_id,
        sum(share) AS total
      FROM ${consumptionCTE} con
      INNER JOIN categories cat ON con.category_id = cat.id
      ${whereClause}
      GROUP BY paid_to, cat.id
    ),

    one_category_per_row AS (
      SELECT
        jsonb_insert(
          jsonb_group_object("uid", total),
          '$.categoryId', category_id
        ) AS category
      FROM sums_per_row
      GROUP BY category_id
      ORDER BY sum(total) DESC
    )

    SELECT coalesce(
      ${groupingFn}(category), 
      json_array()
    ) AS "consumption"
    FROM one_category_per_row
  )`;
}
