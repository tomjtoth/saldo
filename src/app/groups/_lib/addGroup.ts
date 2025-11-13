import { eq } from "drizzle-orm";

import { err, nullEmptyStrings } from "@/app/_lib/utils";
import { DbUser } from "@/app/_lib/db";
import { atomic, CrGroup, DbGroup } from "@/app/_lib/db";
import { groups, memberships } from "@/app/_lib/db/schema";
import { currentUser } from "@/app/(users)/_lib";
import { Category } from "@/app/categories/_lib";
import { Receipt } from "@/app/receipts/_lib";
import { COLS_WITH } from "./common";

type GroupAdder = Pick<DbGroup, "name"> & Partial<Pick<DbGroup, "description">>;

export async function apiAddGroup({ name, description }: GroupAdder) {
  const user = await currentUser();

  const typeDescr = typeof description;

  if (
    typeof name !== "string" ||
    (description !== null &&
      typeDescr !== "string" &&
      typeDescr !== "undefined")
  )
    err(400);

  const data = nullEmptyStrings({ name, description });

  return await svcAddGroup(user.id, data);
}

export async function svcAddGroup(
  ownerId: DbUser["id"],
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

      const res = await tx.query.groups.findFirst({
        ...COLS_WITH,
        where: eq(groups.id, groupId),
      });

      return {
        ...res,
        receipts: [] as Receipt[],
        categories: [] as Category[],
      };
    }
  );
}
