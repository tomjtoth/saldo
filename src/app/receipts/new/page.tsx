import { col, fn, Op } from "sequelize";

import { auth, signIn } from "@/auth";
import StoreProvider from "@/app/StoreProvider";
import { Category, User } from "@/lib/models";
import { currentUser } from "@/lib/services/user";

import Header from "@/components/header";
import CliReceiptAdder from "@/components/receipt-adder-client-side";

export default async function NewReceiptPage() {
  const session = await auth();
  if (!session) return signIn("", { redirectTo: "/receipts/new" });

  const [user, users, categories] = await Promise.all([
    currentUser(session),
    User.findAll({ order: ["name"] }),
    Category.findAll({
      where: {
        statusId: {
          [Op.eq]: 1,
        },
      },
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
            users: users.map(({ id, name, email }) => ({ id, name, email })),
            categories: categories.map(({ id, statusId, description }) => ({
              id,
              statusId,
              description,
            })),

            paidBy: user.id,
          }}
        />
      </StoreProvider>
    </>
  );
}
