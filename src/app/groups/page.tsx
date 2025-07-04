import { auth, signIn } from "@/auth";
import { getGroupsDataFor } from "@/lib/services/groups";
import { currentUser } from "@/lib/services/user";

import CliGroupsPage from "@/components/groups";
import UserMenu from "@/components/user-menu";

export const dynamic = "force-dynamic";

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ groupId?: string }>;
}) {
  const { groupId } = await params;

  const sess = await auth();
  if (!sess)
    return signIn("", {
      redirectTo: groupId ? `/groups/${groupId}` : "/groups",
    });

  const gidAsNum = Number(groupId);

  const user = await currentUser(sess);
  const groups = await getGroupsDataFor(user.id);

  return (
    <CliGroupsPage
      {...{
        userMenu: <UserMenu />,

        groupId: isNaN(gidAsNum) ? undefined : gidAsNum,
        defaultGroupId: user.defaultGroupId,
        groups: groups.map((grp) => grp.get({ plain: true })),
      }}
    />
  );
}
