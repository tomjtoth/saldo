import { Session } from "next-auth";

import { Revision, TCrUser, atomic, User } from "../models";
import { createGroup } from "./groups";

export async function addUser(userData: TCrUser) {
  return await atomic("Adding new user", async (transaction) => {
    const user = await User.create(userData, { transaction });

    const rev = await Revision.create({ revBy: user.id }, { transaction });

    await user.update({ revId: rev.id }, { transaction });

    return user;
  });
}

export async function currentUser(session: Session) {
  // OAuth profiles without an email are disallowed in @/auth.ts
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const email = session?.user?.email!;
  const name = session?.user?.name ?? `User #${await User.count()}`;

  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await addUser({
      name,
      email,
    });

    await createGroup(user.id, { name: "just you" });
  }

  if (name !== user.name) await user.update({ name });

  return user;
}

export async function getPartnersOf() {
  return await User.findAll({
    order: ["name"],
  });
}
