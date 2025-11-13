import { eq, exists, and, sql } from "drizzle-orm";

import { sortByName } from "@/app/_lib/utils";
import { db, isActive } from "@/app/_lib/db";
import { groups, memberships } from "@/app/_lib/db/schema";
import { User } from "@/app/(users)/_lib";
import { COLS_WITH } from "./common";

export async function svcGetGroups(userId: User["id"]) {
  const res = await db.query.groups.findMany({
    ...COLS_WITH,
    where: exists(
      db
        .select({ x: sql`1` })
        .from(memberships)
        .where(
          and(
            eq(memberships.groupId, groups.id),
            eq(memberships.userId, userId),
            isActive(memberships)
          )
        )
    ),
  });

  res.sort(sortByName);
  res.forEach((grp) =>
    grp.memberships!.sort((a, b) => sortByName(a.user!, b.user!))
  );

  return res;
}
