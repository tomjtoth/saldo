import { Session } from "next-auth";
import { eq } from "drizzle-orm";

import { createGroup } from "./groups";
import { atomic, db, TCrUser, TUser } from "../db";
import { revisions, users } from "../db/schema";

export async function addUser(
  userData: Pick<TCrUser, "email" | "image" | "name">
) {
  return await atomic(
    { operation: "Adding new user", revisedBy: -1, deferForeignKeys: true },
    async (tx, revisionId) => {
      const [user] = await tx
        .insert(users)
        .values({
          ...userData,
          revisionId,
        })
        .returning({
          id: users.id,
          statusId: users.statusId,
          name: users.name,
          email: users.email,
          image: users.image,
          defaultGroupId: users.defaultGroupId,
        });

      await tx.update(revisions).set({
        createdById: user.id,
      });

      return user;
    }
  );
}

export async function currentUser(session: Session) {
  // OAuth profiles without an email are disallowed in @/auth.ts
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const email = session?.user?.email!;
  const name = session?.user?.name ?? `User #${(await db.$count(users)) + 1}`;
  const image = session?.user?.image ?? null;

  let user = await db.query.users.findFirst({
    columns: {
      id: true,
      statusId: true,
      name: true,
      email: true,
      image: true,
      defaultGroupId: true,
    },
    where: eq(users.email, email),
  });

  if (!user) {
    user = await addUser({
      name,
      email,
      image,
    })!;

    await createGroup(user.id!, { name: "just you" });
  }

  const updater: TUser = {};

  if (name !== user.name) {
    updater.name = user.name = name;
  }

  if (image && image !== user.image) {
    updater.image = user.image = image;
  }

  if (Object.keys(updater).length > 0) {
    await db.update(users).set(updater).where(eq(users.id, user.id!));
  }

  return user;
}
