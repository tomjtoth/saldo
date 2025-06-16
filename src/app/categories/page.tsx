import React from "react";

import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { getGroupsOf } from "@/lib/services/groups";
import { getCatsOf } from "@/lib/services/categories";

import Header from "@/components/header";
import CliCategoriesPage from "@/components/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const sess = await auth();
  if (!sess) return signIn("", { redirectTo: "/categories" });

  const user = await currentUser(sess);

  const [cats, groups] = await Promise.all([
    getCatsOf(user.id),
    getGroupsOf(user.id, { forCategories: true }),
  ]);

  return (
    <>
      <Header>
        <h2>Categories</h2>
      </Header>

      <CliCategoriesPage
        cats={cats.map((cat) => cat.get({ plain: true }))}
        groups={groups.map((grp) => grp.get({ plain: true }))}
      />
    </>
  );
}
