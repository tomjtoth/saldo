import { auth, signIn } from "@/auth";
import { getGroupsOf } from "@/lib/services/groups";
import { currentUser } from "@/lib/services/user";

import CliGroupsPage from "@/components/groups";
import UserMenu from "@/components/user-menu";

export const dynamic = "force-dynamic";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sess = await auth();
  if (!sess) return signIn("", { redirectTo: "/categories" });

  const user = await currentUser(sess);
  const groups = await getGroupsOf(user.id);
  const { id } = await searchParams;

  const userMenu = <UserMenu />;

  return (
    <CliGroupsPage
      {...{
        preSelected: id as string | undefined,
        userMenu,
        groups: groups.map((grp) => grp.get({ plain: true })),
      }}
    />
  );
}
