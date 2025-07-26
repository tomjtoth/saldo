import { Session } from "next-auth";

import { Revisions, TCrUser, Users } from "../models";
import { createGroup } from "./groups";
import { atomic, db } from "../db";

export function addUser(userData: TCrUser) {
  return atomic({ operation: "Adding new user" }, () => {
    const [rev] = Revisions.insert({ createdById: -1 });
    const [user] = Users.insert(userData, { revisionId: rev.id });

    rev.createdById = user.id;

    // this should be the only place in the app where updating via raw SQL
    db.prepare(
      "UPDATE revisions SET createdById = :createdById WHERE id = :id"
    ).run(rev);

    return user;
  });
}

export async function currentUser(session: Session) {
  // OAuth profiles without an email are disallowed in @/auth.ts
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const email = session?.user?.email!;
  const name = session?.user?.name ?? `User #${Users.count()}`;
  const image = session?.user?.image;

  let user = Users.where({ email }).get(0);
  if (!user) {
    user = addUser({ name, email });

    await createGroup(user.id, { name: "just you" });
  }

  let updating = false;

  if (name !== user.name) {
    updating = true;
    user.name = name;
  }

  if (image && image !== user.image) {
    updating = true;
    user.image = image;
  }

  if (updating) Users.insert(user, { upsert: true });

  return user;
}
