import { Session } from "next-auth";

import { Revision, TCrUser, atomic, User } from "../models";

export async function addUser(userData: TCrUser) {
  return await atomic("Adding new user", async (transaction) => {
    const user = await User.create(userData, { transaction });

    const rev = await Revision.create({ revBy: user.id }, { transaction });

    user.set({ revId: rev.id });
    await user.save({ transaction });

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
  }

  if (name !== user.name) {
    user.name = name;
    await user.save();
  }

  return user;
}

export async function getPartnersOf() {
  return await User.findAll({
    order: ["name"],
  });
}
