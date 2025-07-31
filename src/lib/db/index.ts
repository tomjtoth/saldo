import { PrismaClient } from "@prisma/client";

import { dateFromInt, datetimeFromInt } from "../utils";

export * from "./types";
export { migrator } from "./migrator";
export { atomic } from "./atomic";

export const db = new PrismaClient().$extends({
  result: {
    receipt: {
      paidOn: {
        needs: { paidOnInt: true },
        compute: (rec) => dateFromInt(rec.paidOnInt),
      },
    },
    revision: {
      createdOn: {
        needs: { createdAtInt: true },
        compute: (rev) => datetimeFromInt(rev.createdAtInt)!,
      },
    },
    membership: {
      admin: {
        needs: { statusId: true },
        compute: (data) => data.statusId & 2,
      },
    },
  },
});
