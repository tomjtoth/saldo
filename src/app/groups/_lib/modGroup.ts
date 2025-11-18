"use server";

import { eq } from "drizzle-orm";

import { err, is, nullEmptyStrings } from "@/app/_lib/utils";
import { modEntity } from "@/app/_lib/db";
import { atomic, DbGroup } from "@/app/_lib/db";
import { groups } from "@/app/_lib/db/schema";
import { currentUser, User } from "@/app/(users)/_lib";
import { Group, svcGetGroups } from "./getGroups";

type GroupModifier = Pick<DbGroup, "id"> &
  Partial<Omit<DbGroup, "id" | "revisionId">>;

export async function apiModGroup({
  id,
  flags,
  name,
  description,
}: Omit<GroupModifier, "uuid">) {
  if (
    !is.number(id) ||
    !is.numberOrUndefined(flags) ||
    !is.stringOrUndefined(name) ||
    !is.stringNullOrUndefined(description)
  )
    err();

  const user = await currentUser();

  const data = nullEmptyStrings({
    id,
    flags,
    name,
    description,
  });

  return await svcModGroup(user.id, data);
}

export async function svcModGroup(
  revisedBy: User["id"],
  { id, ...modifier }: GroupModifier
): Promise<Group> {
  return await atomic(
    { operation: "Updating group", revisedBy },
    async (tx, revisionId) => {
      const group = await tx.query.groups.findFirst({
        where: eq(groups.id, id),
      });

      if (!group) err(404);

      await modEntity(group, modifier, {
        tx,
        tableName: "groups",
        primaryKeys: { id: true },
        revisionId,
        skipArchivalOf: { uuid: true },
      });

      const [res] = await svcGetGroups(revisedBy, {
        tx,
        where: eq(groups.id, group.id),
      });

      return res;
    }
  );
}
