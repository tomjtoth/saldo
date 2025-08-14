import { Session } from "next-auth";

import { createGroup } from "./groups";
import { atomic, db, TCrUser } from "../db";
import { revisions, users } from "../db/schema";

export async function addUser(userData: TCrUser) {
  return await atomic(
    { operation: "Adding new user", revisedBy: -1, deferForeignKeys: true },
    async (tx, revisionId) => {
      const [user] = await tx
        .insert(users)
        .values({
          ...userData,
          revisionId,
        })
        .returning({ id: users.id });

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
  const name = session?.user?.name ?? `User #${await db.user.count()}`;
  const image = session?.user?.image ?? null;

  let user = await db.user.findFirst({ where: { email } });

  if (!user) {
    user = await addUser({
      name,
      email,
      image,
    });

    await createGroup(user.id, { name: "just you" });
  }

  const updater: Partial<User> = {};

  if (name !== user.name) {
    updater.name = user.name = name;
  }

  if (image && image !== user.image) {
    updater.image = user.image = image;
  }

  if (Object.keys(updater).length > 0) {
    await db.user.update({
      where: { id: user.id },
      data: { ...updater },
    });
  }

  return user;
}
