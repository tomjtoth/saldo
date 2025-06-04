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
  const email = session?.user?.email!;

  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await addUser({
      name: session?.user?.name ?? `User #${await User.count()}`,
      email,
    });
  }

  return user;
}
