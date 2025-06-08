import { col, fn, Op } from "sequelize";

import { auth, signIn } from "@/auth";
import StoreProvider from "@/app/StoreProvider";
import { Category, User } from "@/lib/models";
import { currentUser } from "@/lib/services/user";

import Header from "@/components/header";
import CliReceiptAdder from "@/components/receipts";

export const dynamic = "force-dynamic";

export default async function NewReceiptPage() {
  const session = await auth();
  if (!session) return signIn("", { redirectTo: "/receipts/new" });

  const [user, users, categories] = await Promise.all([
    currentUser(session),
    User.findAll({ order: ["name"] }),
    Category.findAll({
      where: { statusId: { [Op.eq]: 1 } },
      order: [[fn("LOWER", col("description")), "ASC"]],
    }),
  ]);

  return (
    <>
      <Header {...{ session }}>
        <h2>New receipt</h2>
      </Header>
      <StoreProvider>
        <CliReceiptAdder
          {...{
            users: users.map((u) => u.get({ plain: true })),
            categories: categories.map((cat) => cat.get({ plain: true })),

            paidBy: user.id,
          }}
        />
      </StoreProvider>
    </>
  );
}
