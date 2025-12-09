"use server";

import { db } from "@/app/_lib/db";
import { apiInternal, be, err, is } from "@/app/_lib/utils";
import { currentUser } from "@/app/(users)/_lib";
import { Group, svcGetGroupViaUserAccess } from "@/app/groups/_lib";
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
  return apiInternal(async () => {
    be.number(groupId, "group ID");
    be.array(knownIds, "receipt IDs");

    if (!knownIds.every(is.number))
      err("known ids contain NaN", { args: { knownIds } });

    const user = await currentUser();

    await svcGetGroupViaUserAccess(user.id, groupId, {
      info: "getting receipts",
    });

    return await svcGetReceipts(groupId, knownIds);
  });
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
