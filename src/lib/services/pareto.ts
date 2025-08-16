import { DateTime } from "luxon";
import { sql, eq, and } from "drizzle-orm";

import { db, isActive, TGroup } from "@/lib/db";
import { dateToInt, EUROPE_HELSINKI } from "../utils";
import {
  categories,
  groups,
  items,
  itemShares,
  memberships,
  receipts,
  users,
} from "../db/schema";

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

  const consumption = db.$with("consumption").as((qb) =>
    qb
      .select({
        groupId: sql<number>`${receipts.groupId}`.as("consumption_group_id"),
        paidOn: sql<number>`${receipts.paidOn}`.as("consumption_paid_on"),
        paidBy: sql<number>`${receipts.paidById}`.as("consumption_paid_by"),
        paidTo:
          sql<number>`coalesce(${itemShares.userId}, ${receipts.paidById})`.as(
            "consumption_paid_to"
          ),
        itemId: sql<number>`${items.id}`.as("consumption_item_id"),
        categoryId: sql<number>`${items.categoryId}`.as(
          "consumption_category_id"
        ),
        share: sql<number>`${items.cost} / 100.0 * coalesce(
        ${itemShares.share} * 1.0 / sum(${itemShares.share}) OVER (PARTITION BY ${items.id}), 1
      )`.as("consumption_share"),
      })
      .from(receipts)
      .innerJoin(items, and(eq(receipts.id, items.receiptId), isActive(items)))
      .leftJoin(
        itemShares,
        and(eq(items.id, itemShares.itemId), isActive(itemShares))
      )
      .where(isActive(receipts))
      .orderBy(receipts.paidOn)
  );

  const sumsPerRow = db.$with("sums_per_row").as((qb) =>
    qb
      .select({
        groupId: sql<number>`${groups.id}`.as("cte1_group_id"),
        groupName: sql<string>`${groups.name}`.as("group_name"),
        categoryName: sql<string>`${categories.name}`.as("category_name"),
        total: sql<number>`sum(${consumption.share})`.as("total"),
      })
      .from(memberships)
      .innerJoin(consumption, eq(memberships.groupId, consumption.groupId))
      .innerJoin(categories, eq(categories.id, consumption.categoryId))
      .innerJoin(users, eq(users.id, consumption.paidTo))
      .innerJoin(groups, eq(groups.id, consumption.groupId))
      .where(
        and(
          eq(users.id, userId),

          opts.from &&
            // SQL injection prevented here
            DateTime.fromISO(opts.from, EUROPE_HELSINKI).isValid
            ? sql`${consumption.paidOn} > ${dateToInt(opts.from)}`
            : undefined,

          opts.to &&
            // SQL injection prevented here
            DateTime.fromISO(opts.to, EUROPE_HELSINKI).isValid
            ? sql`${consumption.paidOn} < ${dateToInt(opts.to)}`
            : undefined
        )
      )
      .groupBy(
        sql`${sql.identifier("cte1_group_id")}`,
        sql`${consumption.paidTo}`,
        sql`${consumption.categoryId}`
      )
  );

  const test = await db.with(consumption, sumsPerRow).select().from(sumsPerRow);
  console.log(test);

  const data = await db.get<{ json: string } | null>(
    sql`WITH sums_per_row AS (
      SELECT
        g.id AS gid,
        g.name AS gName,
        cats.name AS cat,
        u.name AS user,
        sum(share) AS total
      FROM "memberships" ms
      INNER JOIN consumption con ON ms.group_id = con.groupId
      INNER JOIN "categories" cats ON con.categoryId = cats.id
      INNER JOIN "users" u ON u.id = con.paidTo
      INNER JOIN "groups" g ON g.id = con.groupId
      WHERE ms.user_id = ${userId} ${sql.raw(`${from} ${to}`)}
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

  return data ? (JSON.parse(data.json) as TGroup[]) : [];
}
