"use server";

import { db } from "@/app/_lib/db";
import { apiInternal, be } from "@/app/_lib/utils";
import { currentUser } from "@/app/(users)/_lib";
import { Group, svcGetGroupViaUserAccess } from "@/app/groups/_lib";
import { populateReceiptArchivesRecursively } from "./populateRecursively";
import { KnownIdBounds, queryReceipts } from "./common";

export async function apiGetReceipts(
  groupId: Group["id"],
  { min, max }: KnownIdBounds,
) {
  return apiInternal(async () => {
    be.number(groupId, "group ID");
    be.number(min, "knownIds.min");
    be.number(max, "knownIds.max");

    const user = await currentUser();

    await svcGetGroupViaUserAccess(user.id, groupId, {
      info: "getting receipts",
      groupMustBeActive: false,
    });

    return await svcGetReceipts(groupId, { min, max });
  });
}

export async function svcGetReceipts(
  groupId: Group["id"],
  knownIds: KnownIdBounds,
) {
  const res = await db.query.receipts.findMany(
    queryReceipts({ knownIds, groupId }),
  );

  return await populateReceiptArchivesRecursively(res);
}
