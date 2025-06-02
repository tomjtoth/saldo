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

export async function registerUser(session: Session | null) {
  const email = session?.user?.email;

  if (!email) return false;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    try {
      await addUser({
        name: session.user?.name ?? `User #${await User.count()}`,
        email,
      });
    } catch {
      return false;
    }
  }
  return true;
}
