import { db } from "@/app/_lib/db";
import wrapRoute from "@/app/_lib/wrapRoute";
import { svcGetGroups } from "@/app/groups/_lib";
import { USERS_EXTRAS } from "@/app/(users)/_lib";

export const GET = wrapRoute({ requireSession: false }, async () => {
  const users = await db.query.users.findMany(USERS_EXTRAS);

  return await Promise.all(
    users.map(async (user) => ({
      user,
      groups: await svcGetGroups(user.id, {
        extras: {
          receipts: { getAll: true },
          balance: true,
          consumption: {},
        },
      }),
    }))
  );
});
