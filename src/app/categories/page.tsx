import React from "react";
import { col, fn, Op } from "sequelize";

import { Category, CategoryArchive, Revision, Status } from "@/lib/models";
import { currentUser } from "@/lib/services/user";
import { auth, signIn } from "@/auth";

import Header from "@/components/header";
import { CliCategoriesPage } from "@/components/categories";
import StoreProvider from "../StoreProvider";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const sess = await auth();
  if (!sess) return signIn("", { redirectTo: "/categories" });

  const user = await currentUser(sess);
  const [cats, statuses] = await Promise.all([
    Category.findAll({
      order: [[fn("LOWER", col("Category.description")), "ASC"]],
      include: [
        {
          model: Revision,
          // TODO: get all partners of user
          where: { revBy: { [Op.in]: [user.id] } },
        },
        {
          model: CategoryArchive,
          as: "archives",
        },
      ],
    }),
    Status.findAll({ where: { id: { [Op.in]: [1, 2] } } }),
  ]);

  return (
    <StoreProvider>
      <Header>
        <h2>Categories</h2>
      </Header>

      <CliCategoriesPage
        {...{
          categories: cats.map((cat) => cat.get({ plain: true })),
          statuses: statuses.map((st) => st.get({ plain: true })),
        }}
      />
    </StoreProvider>
  );
}
