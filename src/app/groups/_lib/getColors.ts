import { sql } from "drizzle-orm";

import { User } from "@/app/(users)/_lib";
import { Schema } from "@/app/_lib/db";

export function colorsForGroups(userId: User["id"]) {
  return (users: Schema["users"]) =>
    sql<string>`printf('#%06x', coalesce(
      (
        SELECT cc.color FROM chart_colors cc
        WHERE cc.user_id = ${userId}
        AND cc.group_id = "d0"."id" -- "d0" ~ "groups"
        AND cc.member_id = ${users.id}
      ),
      (
        SELECT cc.color FROM chart_colors cc
        WHERE cc.user_id = ${users.id}
        AND cc.group_id = "d0"."id" -- "d0" ~ "groups"
        AND cc.member_id IS NULL
      ),
      (
        SELECT cc.color FROM chart_colors cc
        WHERE cc.user_id = ${users.id}
        AND cc.group_id IS NULL
        AND cc.member_id IS NULL
      ),
      abs(random()) % 0x1000000
    )
  )`;
}
