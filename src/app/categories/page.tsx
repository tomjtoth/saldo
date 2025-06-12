import React from "react";
import { Op } from "sequelize";

import { auth, signIn } from "@/auth";
import { Status } from "@/lib/models";
import { currentUser } from "@/lib/services/user";
import { getCatsOf } from "@/lib/services/categories";

import Header from "@/components/header";
import { CliCategoriesPage } from "@/components/categories";
import StoreProvider from "../StoreProvider";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const sess = await auth();
  if (!sess) return signIn("", { redirectTo: "/categories" });

  const user = await currentUser(sess);

  const [cats, statuses] = await Promise.all([
    getCatsOf(user.id),
    Status.findAll({ where: { id: { [Op.in]: [1, 2] } }, raw: true }),
  ]);

  return (
    <StoreProvider>
      <Header>
        <h2>Categories</h2>
      </Header>

      <CliCategoriesPage
        {...{
          categories: cats.map((cat) => cat.get({ plain: true })),
          statuses,
        }}
      />
    </StoreProvider>
  );
}
