import { db } from "@/app/_lib/db";
import wrapRoute from "@/app/_lib/wrapRoute";
import { svcGetGroups } from "@/app/groups/_lib";

export const GET = wrapRoute({ requireSession: false }, async () => {
  const users = await db.query.users.findMany({ columns: { id: true } });

  const queries = await Promise.all(
    users.map((user) =>
      svcGetGroups(user.id, {
        extras: {
          receipts: { getAll: true },
          balance: true,
          consumption: {},
        },
      })
    )
  );

  const res = Object.fromEntries(
    users.map((user, idx) => [user.id, queries[idx]])
  );

  return res;
});
