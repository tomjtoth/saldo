"use server";

import { sql } from "drizzle-orm";

import { db, distinctUsersData, TGroup } from "@/lib/db";
import { VDate } from "../utils";
import { currentUser } from "./users";

type ParetoOpts = {
  from?: string;
  to?: string;
};

export async function svcGetParetoData(opts: ParetoOpts) {
  const { id } = await currentUser();

  return getPareto(id, opts);
}

export async function getPareto(userId: number, opts: ParetoOpts = {}) {
  const from =
    opts.from &&
    // SQL injection prevented here
    VDate.couldBeParsedFrom(opts.from)
      ? `AND paid_on >= ${VDate.toInt(opts.from)}`
      : "";

  const to =
    opts.to &&
    // SQL injection prevented here
    VDate.couldBeParsedFrom(opts.to)
      ? `AND paid_on <= ${VDate.toInt(opts.to)}`
      : "";

  const data = await db.get<{ json: string } | null>(
    sql`WITH sums_per_row AS (
      SELECT
        con.group_id AS gid,
        paid_to AS "uid",
        c.name AS category,
        sum(share) AS total
      FROM memberships ms
      INNER JOIN consumption con ON ms.group_id = con.group_id
      INNER JOIN categories c ON con.category_id = c.id
      WHERE ms.user_id = ${userId} ${sql.raw(`${from} ${to}`)}
      GROUP BY gid, paid_to, category_id
    ),

    distinct_uids AS (
      SELECT DISTINCT gid, "uid" FROM sums_per_row
    ),

    ${distinctUsersData(userId)},

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
        g.id,
        g.name,
        jsonb_object(
          'id', s3.gid,
          'name', g.name,
          
          'pareto', jsonb_object(
            'users', user_data,
            'categories', categories
          )
        ) AS "data"
      FROM categories_in_array_per_row s3
      INNER JOIN groups g ON g.id = s3.gid
      INNER JOIN distinct_users_data dud ON dud.gid = s3.gid
      LEFT JOIN sums_per_row s1 ON s1.gid = s3.gid
      GROUP BY g.id
      ORDER BY g.name
    )

    -- all groups in 1 array
    SELECT json(jsonb_group_array("data")) AS "json"
    FROM one_group_per_row`
  );

  return data ? (JSON.parse(data.json) as TGroup[]) : [];
}
