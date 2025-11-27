"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/app/_lib/db";
import { memberships } from "@/app/_lib/db/schema";
import { be, err, is } from "@/app/_lib/utils";
import { currentUser } from "@/app/(users)/_lib";
import { Group } from "@/app/groups/_lib";
import {
  populateReceiptArchivesRecursively,
  Receipt,
} from "./populateRecursively";
import { queryReceipts } from "./common";

type ReceiptIds = Receipt["id"][];

export async function apiGetReceipts(
  groupId: Group["id"],
  knownIds: ReceiptIds
) {
  be.number(groupId, "group ID");
  be.array(knownIds, "receipt IDs");

  if (!knownIds.every(is.number)) err("known ids contain NaN");

  const user = await currentUser();

  const ms = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.groupId, groupId),
      eq(memberships.userId, user.id)
    ),
  });

  if (!ms) err(403);

  return await svcGetReceipts(groupId, knownIds);
}

export async function svcGetReceipts(
  groupId: Group["id"],
  knownIds: ReceiptIds = []
) {
  const res = await db.query.receipts.findMany(
    queryReceipts({ knownIds, groupId })
  );

  return await populateReceiptArchivesRecursively(res);
}
