"use server";

import { eq } from "drizzle-orm";

import { err, is, nullEmptyStrings } from "@/app/_lib/utils";
import { atomic, CrGroup, DbGroup } from "@/app/_lib/db";
import { groups, memberships } from "@/app/_lib/db/schema";
import { currentUser, User } from "@/app/(users)/_lib";
import { svcGetGroups } from "./getGroups";

type GroupAdder = Pick<DbGroup, "name"> & Partial<Pick<DbGroup, "description">>;

export async function apiAddGroup({ name, description }: GroupAdder) {
  const user = await currentUser();

  if (
    !is.stringWith3ConsecutiveLetters(name) ||
    !is.stringNullOrUndefined(description)
  )
    err(400);

  const data = nullEmptyStrings({ name, description });

  return await svcAddGroup(user.id, data);
}

export async function svcAddGroup(
  ownerId: User["id"],
  data: Pick<CrGroup, "name" | "description">
) {
  return await atomic(
    { operation: "creating new group", revisedBy: ownerId },
    async (tx, revisionId) => {
      const [{ groupId }] = await tx
        .insert(groups)
        .values({
          ...data,
          revisionId,
        })
        .returning({
          groupId: groups.id,
        });

      await tx.insert(memberships).values({
        userId: ownerId,
        flags: 3,
        groupId,
        revisionId,
      });

      const [res] = await svcGetGroups(ownerId, {
        tx,
        where: eq(groups.id, groupId),
      });

      return res;
    }
  );
}
