import { sql } from "drizzle-orm";

import { VDate } from "@/app/_lib/utils";

export type ConsumptionOpts = {
  from?: string;
  to?: string;
  jsonB?: true;
};

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
      FROM consumption con
      INNER JOIN categories cat ON con.category_id = cat.id
        -- had to filter to group here, the WHERE clause wouldn't work..
        AND cat.group_id = "d0"."id" -- "d0" ~ "id"
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
