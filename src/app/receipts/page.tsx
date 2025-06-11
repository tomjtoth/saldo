import { col, fn, Op } from "sequelize";

import { auth, signIn } from "@/auth";
import StoreProvider from "@/app/StoreProvider";
import {
  Category,
  CategoryArchive,
  Item,
  ItemShare,
  Receipt,
  ReceiptArchive,
  Revision,
  User,
} from "@/lib/models";
import { currentUser } from "@/lib/services/user";

import CliReceiptAdder from "@/components/receipts";
import Header from "@/components/header";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const session = await auth();
  if (!session) return signIn("", { redirectTo: "/receipts" });

  const user = await currentUser(session);

  const [users, categories, receipts] = await Promise.all([
    User.findAll({ order: ["name"] }),
    Category.findAll({
      include: [
        {
          model: Item,
          include: [
            {
              model: ItemShare,
              as: "shares",
              where: { userId: user.id },
              attributes: [],
            },
          ],
          attributes: [],
        },
        Revision,
        {
          model: CategoryArchive,
          as: "archives",
          include: [Revision],
        },
      ],
      where: {
        [Op.and]: [
          { statusId: { [Op.eq]: 1 } },
          {
            [Op.or]: [
              // Used by this user (via ItemShare)
              { "$Items.shares.user_id$": user.id },
              // Category revision by this user
              { "$Revision.rev_by$": user.id },
              // Archive revision by this user
              { "$archives.Revision.rev_by$": user.id },
            ],
          },
        ],
      },
      order: [[fn("LOWER", col("Category.description")), "ASC"]],
    }),
    Receipt.findAll({
      order: [["paidOn", "DESC"]],
      include: [
        { model: Item, as: "items" },
        {
          model: Revision,
          // TODO: get all partners of user
          where: { revBy: { [Op.in]: [user.id] } },
          include: [User],
        },
        {
          model: ReceiptArchive,
          as: "archives",
          separate: true,
          include: [{ model: Revision, include: [User] }],
          limit: 1,
        },
      ],
      limit: 200,
    }),
  ]);

  return (
    <StoreProvider>
      <Header className="flex items-center gap-2">
        <h2>Receipts</h2>
        <CliReceiptAdder
          {...{
            users: users.map((u) => u.get({ plain: true })),
            categories: categories.map((cat) => cat.get({ plain: true })),

            paidBy: user.id,
          }}
        />
      </Header>

      <div className="p-2 grid gap-2 grid-cols-[auto_auto_auto_auto] sm:grid-cols-8 lg:sm:grid-cols-12 2xl:sm:grid-cols-16">
        {receipts.map((rcpt) => (
          <div
            key={rcpt.id}
            className="p-1 border rounded grid gap-2 col-span-4 grid-cols-subgrid"
          >
            <div>🛍️ {rcpt.items?.length}</div>
            <div>🗓️ {rcpt.paidOn}</div>

            <div>
              🧔{" "}
              {rcpt.archives!.length > 0
                ? rcpt.archives?.at(0)?.Revision?.User?.name
                : rcpt.Revision?.User?.name}
            </div>

            <div>💸 {rcpt.User?.name}</div>
          </div>
        ))}
      </div>
    </StoreProvider>
  );
}
