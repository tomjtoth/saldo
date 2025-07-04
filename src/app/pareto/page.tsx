import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/user";

import UserMenu from "@/components/user-menu";
import CliParetoPage from "@/components/pareto";
import { getParetoDataFor } from "@/lib/services/pareto";
import { getGroupsDataFor } from "@/lib/services/groups";

export const dynamic = "force-dynamic";

export default async function ParetoPage({
  params,
}: {
  params: Promise<{ groupId?: string }>;
}) {
  const { groupId } = await params;

  const sess = await auth();
  if (!sess) return signIn("", { redirectTo: "/pareto" });

  const gidAsNum = Number(groupId);

  const user = await currentUser(sess);
  const pareto = await getParetoDataFor(user.id);
  const groups = await getGroupsDataFor(user.id);

  return (
    <CliParetoPage
      {...{
        userMenu: <UserMenu />,

        groupId: isNaN(gidAsNum) ? undefined : gidAsNum,
        groups: groups.map((group) => group.get({ plain: true })),

        ...pareto,
      }}
    />
  );
}
