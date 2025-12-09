"use server";

import { eq } from "drizzle-orm";

import { apiInternal, be, nullEmptyStrings } from "@/app/_lib/utils";
import { modEntity } from "@/app/_lib/db";
import { atomic, DbGroup } from "@/app/_lib/db";
import { groups } from "@/app/_lib/db/schema";
import { currentUser, User } from "@/app/(users)/_lib";
import { Group, svcGetGroups } from "./getGroups";
import { svcGetGroupViaUserAccess } from "./access";

type GroupModifier = Pick<DbGroup, "id"> &
  Partial<Omit<DbGroup, "id" | "revisionId">>;

export async function apiModGroup({
  id,
  flags,
  name,
  description,
}: Omit<GroupModifier, "uuid">) {
  return apiInternal(async () => {
    be.number(id, "group ID");
    be.numberOrUndefined(flags, "flags");
    be.stringOrUndefined(name, "name");
    be.stringNullOrUndefined(description, "description");

    const user = await currentUser();

    await svcGetGroupViaUserAccess(user.id, id, {
      userMustBeAdmin: true,
      groupMustBeActive: false,
      info: "modifying group",
      args: { flags, name, description },
    });

    const data = nullEmptyStrings({
      id,
      flags,
      name,
      description,
    });

    return await svcModGroup(user.id, data);
  });
}

export async function svcModGroup(
  revisedBy: User["id"],
  { id, ...modifier }: GroupModifier
): Promise<Group> {
  return await atomic(
    { operation: "Updating group", revisedBy },
    async (tx, revisionId) => {
      const [group] = await tx.query.groups.findMany({
        where: eq(groups.id, id),
      });

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
