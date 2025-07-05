import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { getBalanceDataFor } from "@/lib/services/balance";

import UserMenu from "@/components/user-menu";
import CliBalancePage from "@/components/balance";

export const dynamic = "force-dynamic";

export default async function BalancePage({
  params,
}: {
  params: Promise<{ groupId?: string }>;
}) {
  const { groupId } = await params;

  const sess = await auth();
  if (!sess)
    return signIn("", {
      redirectTo: groupId ? `/groups/${groupId}/balance` : "/balance",
    });

  const gidAsNum = Number(groupId);

  const user = await currentUser(sess);
  const groups = await getBalanceDataFor(user.id);

  return (
    <CliBalancePage
      {...{
        userMenu: <UserMenu />,

        defaultGroupId: user.defaultGroupId,
        groupId: isNaN(gidAsNum) ? undefined : gidAsNum,
        groups,
      }}
    />
  );
}
