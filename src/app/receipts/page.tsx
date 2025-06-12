import { auth, signIn } from "@/auth";
import StoreProvider from "@/app/StoreProvider";
import { currentUser, getPartnersOf } from "@/lib/services/user";
import { getCatsOf } from "@/lib/services/categories";
import { getReceiptsOf } from "@/lib/services/receipt";

import { CliReceiptAdder, CliReceiptsPage } from "@/components/receipts";
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

      <CliReceiptsPage receipts={receipts.map((r) => r.get({ plain: true }))} />
    </StoreProvider>
  );
}
