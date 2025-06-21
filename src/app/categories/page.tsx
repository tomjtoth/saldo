import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { getCatsDataFor } from "@/lib/services/categories";

import CliCategoriesPage from "@/components/categories";
import UserMenu from "@/components/user-menu";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ groupId?: string }>;
}) {
  const { groupId } = await params;
  const sess = await auth();
  if (!sess)
    return signIn("", {
      redirectTo: groupId ? `/groups/${groupId}/categories` : "/categories",
    });

  const user = await currentUser(sess);
  const groups = await getCatsDataFor(user.id);

  return (
    <CliCategoriesPage
      {...{
        preSelected: groupId,
        userMenu: <UserMenu />,
        groups: groups.map((grp) => grp.get({ plain: true })),
      }}
    />
  );
}
