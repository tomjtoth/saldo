"use server";

import { eq } from "drizzle-orm";

import { auth, signIn } from "@/auth";

import { createGroup } from "./groups";
import { atomic, db, TCrUser, TUser, updater } from "../db";
import { revisions, users } from "../db/schema";
import { err } from "../utils";

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
        .returning();

      await tx
        .update(revisions)
        .set({ createdById: user.id })
        .where(eq(revisions.id, revisionId));

      return user;
    }
  );
}

interface ArgsWithSession {
  errorCode?: number;
  redirectTo?: string;
}

interface ArgsWithoutSession {
  requireSession: false;
}

type AddUserRetVal = Awaited<ReturnType<typeof addUser>>;

export function currentUser(
  args: ArgsWithoutSession
): Promise<void | AddUserRetVal>;

export function currentUser(args?: ArgsWithSession): Promise<AddUserRetVal>;

// Implementation
export async function currentUser(
  args: ArgsWithoutSession | ArgsWithSession = {}
): Promise<void | AddUserRetVal> {
  const session = await auth();

  if (!session) {
    if ("requireSession" in args) return;
    else {
      const { errorCode, redirectTo } = args;
      if (errorCode) err(errorCode);
      return await signIn("", { redirectTo });
    }
  }

  // OAuth profiles without an email are disallowed in @/auth.ts
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const email = session.user?.email!;
  const name = session.user?.name ?? `User #${(await db.$count(users)) + 1}`;
  const image = session.user?.image ?? null;

  let user = await db.query.users.findFirst({
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

export async function updateUser(id: number, modifier: { flags: number }) {
  return await atomic(
    { operation: "Updating user", revisedBy: id },
    async (tx, revisionId) => {
      const user = (await tx.query.users.findFirst({
        where: eq(users.id, id),
      }))!;

      const saving = await updater(user, modifier, {
        tx,
        tableName: "users",
        entityPk1: id,
        revisionId,
      });

      if (saving) {
        const [res] = await tx
          .update(users)
          .set(user)
          .where(eq(users.id, id))
          .returning({ flags: users.flags });

        return res;
      } else err("No changes were made");
    }
  );
}
