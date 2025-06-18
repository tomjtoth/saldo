import { auth, signIn } from "@/auth";
import { getGroupsOf } from "@/lib/services/groups";
import { currentUser } from "@/lib/services/user";

import Header from "@/components/header";
import CliGroupsPage from "@/components/groups";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const sess = await auth();
  if (!sess) return signIn("", { redirectTo: "/categories" });

  const user = await currentUser(sess);
  const groups = await getGroupsOf(user.id);

  return (
    <>
      <Header>
        <h2>Your groups</h2>
      </Header>

      <CliGroupsPage groups={groups.map((grp) => grp.get({ plain: true }))} />
    </>
  );
}
