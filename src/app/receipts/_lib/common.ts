import { sql, desc } from "drizzle-orm";

import { receipts } from "@/app/_lib/db/schema";
import { QueryParamsOf } from "@/app/_lib/db/types";

export const SELECT_RECEIPTS = {
  with: {
    revision: {
      columns: {
        createdAt: true,
      },
      with: {
        createdBy: { columns: { id: true, image: true, name: true } },
      },
    },
    items: {
      with: {
        itemShares: true,
      },
    },
    paidBy: { columns: { id: true, image: true, name: true } },
  },
} as const satisfies QueryParamsOf<"receipts">;

export const queryReceipts = (knownIds: number[] = []) =>
  ({
    ...SELECT_RECEIPTS,
    limit: 50,
    where: sql`${receipts.id} not in ${sql.raw(
      "(" + knownIds.join(", ") + ")"
    )}`,
    orderBy: desc(receipts.paidOn),
  } as const satisfies QueryParamsOf<"receipts">);
