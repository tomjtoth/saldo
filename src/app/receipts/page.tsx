import { col, fn, Op } from "sequelize";

import { auth, signIn } from "@/auth";
import StoreProvider from "@/app/StoreProvider";
import { currentUser, getPartnersOf } from "@/lib/services/user";
import { getCatsOf } from "@/lib/services/categories";
import { getReceiptsOf } from "@/lib/services/receipt";

import CliReceiptAdder from "@/components/receipts";
import Header from "@/components/header";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage() {
  const session = await auth();
  if (!session) return signIn("", { redirectTo: "/receipts" });

  const user = await currentUser(session);

  const [users, categories, receipts] = await Promise.all([
    getPartnersOf(),
    getCatsOf(user.id, { activeOnly: true }),
    getReceiptsOf(user.id),
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
