"use server";

import { eq, exists, and, sql, SQL } from "drizzle-orm";

import { Category } from "@/app/categories/_lib";
import { db, DrizzleTx, isActive } from "@/app/_lib/db";
import { groups, memberships } from "@/app/_lib/db/schema";
import { Receipt } from "@/app/receipts/_lib";
import { sortByName } from "@/app/_lib/utils";
import { svcGetColors } from "./getColors";
import { User } from "@/app/(users)/_lib";

export type Group = Awaited<ReturnType<typeof svcGetGroups>>[number];

export async function svcGetGroups(
  userId: User["id"],
  {
    tx,
    where,
  }: {
    tx?: DrizzleTx;
    where?: SQL<unknown>;
  }
) {
  const colors = await svcGetColors(userId);

  const arr = await (tx ?? db).query.groups.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      flags: true,
      uuid: true,
    },
    with: {
      memberships: {
        columns: { flags: true },
        with: {
          user: {
            columns: { name: true, id: true, email: true, flags: true },
          },
        },
      },
    },
    where:
      where ??
      exists(
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

  return arr.toSorted(sortByName).map((grp) => {
    grp.memberships.sort((a, b) => sortByName(a.user, b.user));

    const users: Pick<User, "id" | "name" | "email" | "color">[] =
      grp.memberships.map((ms) => ({
        ...ms.user,
        color: colors.find(
          (row) => row.groupId === grp.id && row.userId === ms.user.id
        )!.color,
      }));

    return {
      ...grp,
      users,
      categories: [] as Category[],
      receipts: [] as Receipt[],
    };
  });
}

// TODO: remove all of the below, once the typing has been fixed
// (?<=\w)[?!](?=\.)
