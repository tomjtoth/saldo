import { DbGroup, DbReceipt, QueryParamsOf } from "@/app/_lib/db/types";
import { SELECT_REVISION_INFO } from "@/app/_lib";

export const SELECT_RECEIPTS = {
  with: {
    revision: SELECT_REVISION_INFO,
    items: { with: { itemShares: true } },
    paidBy: { columns: { id: true, image: true, name: true } },
  },
} as const satisfies QueryParamsOf<"receipts">;

export const queryReceipts = ({
  groupId,
  knownIds = [],
  getAll,
}: {
  groupId?: DbGroup["id"]; // using type Group here would circular reference
  knownIds?: DbReceipt["id"][];
  getAll?: true;
} = {}) => {
  return {
    ...SELECT_RECEIPTS,

    where: {
      groupId,

      RAW(rcpt, { sql }) {
        const arr = sql.raw(`(${knownIds.join(",")})`);

        return sql`${rcpt.id} NOT IN ${arr}`;
      },
    },

    ...(getAll ? {} : { limit: 50 }),

    orderBy: { paidOn: "desc" },
  } as const satisfies QueryParamsOf<"receipts">;
};
