import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { getGroupsOf } from "@/lib/services/groups";
import { getCatsOf } from "@/lib/services/categories";

import CliCategoriesPage from "@/components/categories";
import UserMenu from "@/components/user-menu";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const sess = await auth();
  if (!sess) return signIn("", { redirectTo: "/categories" });

  const user = await currentUser(sess);

  const [cats, groups] = await Promise.all([
    getCatsOf(user.id),
    getGroupsOf(user.id, { forCategories: true }),
  ]);

  const userMenu = <UserMenu />;

  return (
    <CliCategoriesPage
      {...{
        userMenu,
        cats: cats.map((cat) => cat.get({ plain: true })),
        groups: groups.map((grp) => grp.get({ plain: true })),
      }}
    />
  );
}
