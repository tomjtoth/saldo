"use server";

import { eq } from "drizzle-orm";

import { auth, signIn } from "@/auth";

import { atomic, db, CrUser } from "@/app/_lib/db";
import { revisions, users } from "@/app/_lib/db/schema";
import { svcAddGroup } from "../../groups/_lib";
import { USERS_SELECT } from "./queryOpts";

export type User = Awaited<ReturnType<typeof svcAddUser>>;

export async function svcAddUser(
  userData: Pick<CrUser, "email" | "image" | "name">
) {
  return atomic(-1, async (tx, revisionId) => {
    const [createdRow] = await tx
      .insert(users)
      .values({
        ...userData,
        revisionId,
      })
      .returning();

    await tx
      .update(revisions)
      .set({ createdById: createdRow.id })
      .where(eq(revisions.id, revisionId));

    const [{ categoriesHiddenFromConsumption, ...user }] =
      await tx.query.users.findMany({
        ...USERS_SELECT,
        where: { id: createdRow.id },
      });

    return {
      ...user,
      categoriesHiddenFromConsumption: categoriesHiddenFromConsumption.map(
        (c) => c.id
      ),
    };
  });
}

interface ArgsWithoutSession {
  requireSession: false;
}

export async function currentUser(
  args: ArgsWithoutSession
): Promise<undefined | User>;

export async function currentUser(): Promise<User>;

export async function currentUser(
  args?: ArgsWithoutSession
): Promise<undefined | User> {
  const session = await auth();

  if (!session) {
    const requireSession = args?.requireSession ?? true;
    if (!requireSession) return;

    // left this here since supposedly any path might get a Request-Header: `server function hash` in which case the user is required
    return await signIn();
  }

  // OAuth profiles without an email are disallowed in @/auth.ts
  const email = session.user!.email!;
  const name = session.user!.name ?? `User #${(await db.$count(users)) + 1}`;
  const image = session.user!.image ?? null;

  const tmp = await db.query.users.findFirst({
    ...USERS_SELECT,
    where: { email },
  });

  let user: User;

  if (tmp) {
    // repeating this 2x separately ensures I see a
    // more easily readable type definition of User
    user = {
      ...tmp,
      categoriesHiddenFromConsumption: tmp.categoriesHiddenFromConsumption.map(
        (c) => c.id
      ),
    };
  } else {
    user = await svcAddUser({
      name,
      email,
      image,
    });

    await svcAddGroup(user.id, { name: "just you" });
  }

  const updater: Partial<User> = {};

  if (name !== user.name) {
    updater.name = user.name = name;
  }

  if (image && image !== user.image) {
    updater.image = user.image = image;
  }

  if (Object.keys(updater).length > 0) {
    await db.update(users).set(updater).where(eq(users.id, user.id));
  }

  return user;
}
