import { DbGroup, DbReceipt, QueryParamsOf } from "@/app/_lib/db/types";
import { SELECT_REVISION_INFO } from "@/app/_lib";

export const SELECT_RECEIPTS = {
  with: {
    revision: SELECT_REVISION_INFO,
    items: { with: { itemShares: true } },
    paidBy: { columns: { id: true, image: true, name: true } },
  },
} as const satisfies QueryParamsOf<"receipts">;

export type KnownIdBounds = { min: DbReceipt["id"]; max: DbReceipt["id"] };

export const queryReceipts = ({
  groupId,
  knownIds,
  getAll,
}: {
  // NOTE: using type Group here would circular reference
  groupId?: DbGroup["id"];
  knownIds?: KnownIdBounds;
  getAll?: true;
} = {}) => {
  return {
    ...SELECT_RECEIPTS,

    where: {
      groupId,

      ...(knownIds
        ? { OR: [{ id: { lt: knownIds.min } }, { id: { gt: knownIds.max } }] }
        : {}),
    },

    ...(getAll ? {} : { limit: 50 }),

    orderBy: { paidOn: "desc" },
  } as const satisfies QueryParamsOf<"receipts">;
};
