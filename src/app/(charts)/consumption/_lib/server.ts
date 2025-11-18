"use server";

import { sql } from "drizzle-orm";

import { ConsumptionData, db } from "@/app/_lib/db";
import { Group } from "@/app/groups/_lib";
import { err, VDate } from "@/app/_lib/utils";
import { currentUser, User } from "@/app/(users)/_lib";
import { ConsumptionOpts, consumptionQuery } from "./query";

export async function apiGetConsumption({ from, to }: ConsumptionOpts) {
  const typeFrom = typeof from;
  const typeTo = typeof to;

  if (
    (typeFrom !== "string" && typeFrom !== "undefined") ||
    (typeTo !== "string" && typeTo !== "undefined") ||
    (from && !VDate.couldBeParsedFrom(from)) ||
    (to && !VDate.couldBeParsedFrom(to))
  )
    err(400);

  const user = await currentUser();

  return await svcGetConsumption(user.id, { from, to });
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
        cast("groups"."id" AS TEXT),
        ${consumptionQuery({ ...opts, jsonB: true })}
      ) AS serialized
    FROM memberships ms
    INNER JOIN groups "groups" ON ms.group_id = "groups"."id"
    WHERE ms.user_id = ${userId}
  `);

  const parsed = JSON.parse(serialized) as {
    [groupId: Group["id"]]: ConsumptionData[];
  };

  return parsed;
}
