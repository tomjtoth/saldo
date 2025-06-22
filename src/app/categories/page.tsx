import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { getCatsDataFor } from "@/lib/services/categories";

import CliCategoriesPage from "@/components/categories";
import UserMenu from "@/components/user-menu";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ groupId?: string; catId?: string }>;
}) {
  const { groupId, catId } = await params;
  const sess = await auth();
  if (!sess)
    return signIn("", {
      redirectTo: `${groupId ? `/groups/${groupId}` : ""}/categories${
        catId ? `/${catId}` : ""
      }`,
    });

  const gidAsNum = Number(groupId);
  const cidAsNum = Number(catId);

  const user = await currentUser(sess);
  const groups = await getCatsDataFor(user.id);

  return (
    <CliCategoriesPage
      {...{
        userMenu: <UserMenu />,
        groupId: isNaN(gidAsNum) ? undefined : gidAsNum,
        catId: isNaN(cidAsNum) ? undefined : cidAsNum,
        groups: groups.map((grp) => grp.get({ plain: true })),
      }}
    />
  );
}
