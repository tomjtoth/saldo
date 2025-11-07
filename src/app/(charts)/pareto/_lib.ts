"use server";

import { sql } from "drizzle-orm";

import { db, groupsWithUsersCTE, TGroup } from "@/app/_lib/db";
import { VDate } from "@/app/_lib/utils";
import { currentUser } from "@/app/(users)/_lib";

type ParetoOpts = {
  from?: string;
  to?: string;
};

export async function apiGetParetoData(opts: ParetoOpts) {
  const { id } = await currentUser();
  return await svcGetParetoData(id, opts);
}

export async function svcGetParetoData(userId: number, opts: ParetoOpts = {}) {
  const paidOnCrit: string[] = [];

  // SQL injection prevented here
  if (opts.from && VDate.couldBeParsedFrom(opts.from))
    paidOnCrit.push(`paid_on >= ${VDate.toInt(opts.from)}`);

  // SQL injection prevented here
  if (opts.to && VDate.couldBeParsedFrom(opts.to))
    paidOnCrit.push(`paid_on <= ${VDate.toInt(opts.to)}`);

  const whereClause = sql.raw(
    paidOnCrit.length ? `WHERE ${paidOnCrit.join(" AND ")}` : ""
  );

  const data = await db.get<{ json: string } | null>(
    sql`WITH ${groupsWithUsersCTE(userId)},

    sums_per_row AS (
      SELECT
        gid,
        paid_to AS "uid",
        cat.name AS category,
        sum(share) AS total
      FROM groups_with_users gwu
      LEFT JOIN consumption con ON gwu.gid = con.group_id
      LEFT JOIN categories cat ON con.category_id = cat.id
      ${whereClause}
      GROUP BY gid, paid_to, category_id
    ),

    one_category_per_row AS (
      SELECT
        gid,
        jsonb_insert(
          jsonb_group_object("uid", total),
          '$.category', category
        ) AS category
      FROM sums_per_row
      GROUP BY gid, category
      ORDER BY sum(total) DESC
    ),

    categories_in_array_per_row AS (
      SELECT
        gid,
        jsonb_group_array(category) AS categories
      FROM one_category_per_row
      GROUP BY gid
    ),

    one_group_per_row AS (
      SELECT
        jsonb_object(
          'id', gwu.gid,
          'name', gwu.name,

          'pareto', jsonb_object(
            'users', gwu.users,
            'categories', coalesce(arr.categories, jsonb_array())
          )
        ) AS "group"
      FROM groups_with_users gwu
      LEFT JOIN categories_in_array_per_row arr ON gwu.gid = arr.gid
    )

    -- all groups in 1 array
    SELECT json(jsonb_group_array("group")) AS "json"
    FROM one_group_per_row`
  );

  return data ? (JSON.parse(data.json) as TGroup[]) : [];
}
