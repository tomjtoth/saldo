import { sql, desc, and, eq, SQL } from "drizzle-orm";

import { receipts } from "@/app/_lib/db/schema";
import { DbGroup, QueryParamsOf } from "@/app/_lib/db/types";
import { SELECT_REVISION_INFO } from "@/app/_lib";
import { Receipt } from "./populateRecursively";

export const SELECT_RECEIPTS = {
  with: {
    revision: SELECT_REVISION_INFO,
    items: {
      with: {
        itemShares: true,
      },
    },
    paidBy: { columns: { id: true, image: true, name: true } },
  },
} as const satisfies QueryParamsOf<"receipts">;

export const queryReceipts = (opts?: {
  groupId?: DbGroup["id"]; // using type Group here would circular reference
  knownIds: Receipt["id"][];
  getAll?: true;
}) => {
  const crit: SQL[] = [
    ...(opts?.groupId ? [eq(receipts.groupId, opts.groupId)] : []),
    ...(opts?.knownIds?.length
      ? [
          sql`${receipts.id} not in ${sql.raw(
            "(" + opts.knownIds.join(", ") + ")"
          )}`,
        ]
      : []),
  ];

  return {
    ...SELECT_RECEIPTS,

    ...(opts?.getAll ? {} : { limit: 50 }),

    ...(crit.length ? { where: and(...crit) } : {}),

    orderBy: desc(receipts.paidOn),
  } as const satisfies QueryParamsOf<"receipts">;
};
