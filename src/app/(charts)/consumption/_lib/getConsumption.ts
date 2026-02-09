"use server";

import { sql } from "drizzle-orm";

import { ConsumptionData, db } from "@/app/_lib/db";
import { Group } from "@/app/groups/_lib";
import { apiInternal, be } from "@/app/_lib/utils";
import { currentUser, User } from "@/app/(users)/_lib";
import { ConsumptionOpts, consumptionQuery } from "./query";

export async function apiGetConsumption({ from, to }: ConsumptionOpts) {
  return apiInternal(async () => {
    be.stringOrUndefined(from, "date FROM");
    be.stringOrUndefined(to, "date TO");
    if (from) be.parsableIntoDate(from, "date FROM");
    if (to) be.parsableIntoDate(from, "date TO");

    const user = await currentUser();

    return await svcGetConsumption(user.id, { from, to });
  });
}

export type ConsumptionDataViaAPI = Awaited<
  ReturnType<typeof svcGetConsumption>
>;

export async function svcGetConsumption(
  userId: User["id"],
  opts: ConsumptionOpts = {}
) {
  const { serialized } = await db.get<{
    serialized: string;
  }>(sql`
    SELECT 
      json_group_object(
        cast("d0"."id" AS TEXT), 
        ${consumptionQuery({ ...opts, jsonB: true })}
      ) AS serialized
    FROM memberships ms
    INNER JOIN groups "d0" ON ms.group_id = "d0"."id"
    WHERE ms.user_id = ${userId}
  `);

  const parsed = JSON.parse(serialized) as {
    [groupId: Group["id"]]: ConsumptionData[];
  };

  return parsed;
}
