"use server";

import { eq, sql } from "drizzle-orm";

import { auth, signIn } from "@/auth";

import { atomic, db, CrUser, QueryParamsOf } from "@/app/_lib/db";
import { revisions, users } from "@/app/_lib/db/schema";
import { err } from "@/app/_lib/utils";
import { svcAddGroup } from "../groups/_lib";

export type User = Awaited<ReturnType<typeof svcAddUser>>;

const USERS_EXTRAS = {
  extras: {
    color: sql<string>`
    printf(
      '#%06x', 
      coalesce(
        (
          SELECT color FROM chart_colors
          WHERE user_id = "users"."id"
          AND group_id IS NULL
          AND member_id IS NULL
        ),
        abs(random()) % 0x1000000
      )
    )`.as("color"),
  },
} as const satisfies QueryParamsOf<"users">;

export async function svcAddUser(
  userData: Pick<CrUser, "email" | "image" | "name">
) {
  return await atomic(
    { operation: "Adding new user", revisedBy: -1, deferForeignKeys: true },
    async (tx, revisionId) => {
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

      const [user] = await tx.query.users.findMany({
        ...USERS_EXTRAS,
        where: eq(users.id, createdRow.id),
      });

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

export async function currentUser(
  args: ArgsWithoutSession
): Promise<undefined | User>;

export async function currentUser(args?: ArgsWithSession): Promise<User>;

export async function currentUser(
  args: ArgsWithoutSession | ArgsWithSession = {}
): Promise<undefined | User> {
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
  const email = session.user!.email!;
  const name = session.user!.name ?? `User #${(await db.$count(users)) + 1}`;
  const image = session.user!.image ?? null;

  let user = await db.query.users.findFirst({
    ...USERS_EXTRAS,
    where: eq(users.email, email),
  });

  if (!user) {
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
