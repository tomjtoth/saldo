import { sql } from "drizzle-orm";

import { User } from "@/app/(users)/_lib";
import { db } from "@/app/_lib/db";

// TODO: merge this into the common query
export async function svcGetColors(userId: User["id"]) {
  return await db.all<{
    groupId: number;
    userId: number;
    color: string;
  }>(sql`
    SELECT
      m.group_id AS groupId,
      m2.user_id AS userId,
      printf(
        '#%06x',
        coalesce(
          (
            SELECT cc.color FROM chart_colors cc
            WHERE cc.user_id = ${userId}
            AND cc.group_id = m.group_id
            AND cc.member_id = m2.user_id
          ),
          (
            SELECT cc.color FROM chart_colors cc
            WHERE cc.user_id = m2.user_id
            AND cc.group_id = m.group_id
            AND cc.member_id IS NULL
          ),
          (
            SELECT cc.color FROM chart_colors cc
            WHERE cc.user_id = m2.user_id
            AND cc.group_id IS NULL
            AND cc.member_id IS NULL
          ),
          abs(random()) % 0x1000000
        )
      ) AS color
    FROM memberships m
    INNER JOIN groups g ON g.id = m.group_id
    INNER JOIN memberships m2 ON m2.group_id = m.group_id
    INNER JOIN users u ON u.id = m2.user_id 
    WHERE m.user_id = ${userId}
    GROUP BY m.group_id, m2.user_id
  `);
}
