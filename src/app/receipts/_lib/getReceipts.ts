"use server";

import { and, eq, exists, sql } from "drizzle-orm";

import { db } from "@/app/_lib/db";
import { groups, memberships, receipts } from "@/app/_lib/db/schema";
import { be, err, is } from "@/app/_lib/utils";
import { currentUser, User } from "@/app/(users)/_lib";
import {
  populateReceiptArchivesRecursively,
  Receipt,
} from "./populateRecursively";
import { queryReceipts } from "./common";

type ReceiptIds = Receipt["id"][];

export async function apiGetReceipts(knownIds: ReceiptIds) {
  if (!is.array(knownIds) || knownIds.some((id) => !is.number(id)))
    err("known ids contain NaN");

  const { id } = await currentUser();
  return await svcGetReceipts(id, knownIds);
}

export async function svcGetReceipts(
  userId: User["id"],
  knownIds: ReceiptIds = []
) {
  const res = await db.query.receipts.findMany({
    ...queryReceipts(knownIds),

    where: exists(
      db
        .select({ x: sql`1` })
        .from(memberships)
        .where(
          and(
            eq(receipts.groupId, groups.id),
            eq(groups.id, memberships.groupId),
            eq(memberships.userId, userId)
          )
        )
    ),
  });

  return await populateReceiptArchivesRecursively(res);
}
