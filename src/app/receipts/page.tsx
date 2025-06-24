import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { getReceiptsDataFor } from "@/lib/services/receipt";

import CliReceiptsPage from "@/components/receipts";
import UserMenu from "@/components/user-menu";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage({
  params,
}: {
  params: Promise<{ groupId?: string }>;
}) {
  const { groupId } = await params;

  const session = await auth();
  if (!session)
    return signIn("", {
      redirectTo: groupId ? `/groups/${groupId}/receipts` : "/receipts",
    });

  const user = await currentUser(session);
  const groups = await getReceiptsDataFor(user.id);
  const gidAsNum = Number(groupId);

  return (
    <CliReceiptsPage
      {...{
        userMenu: <UserMenu />,

        userId: user.id,
        groupId: isNaN(gidAsNum) ? undefined : gidAsNum,
        defaultGroupId: user.defaultGroupId,
        groups: groups.map((group) => group.get({ plain: true })),
      }}
    />
  );
}
