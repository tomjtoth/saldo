import React from "react";
import { col, fn, Op } from "sequelize";

import {
  Category,
  CategoryArchive,
  Item,
  ItemShare,
  Revision,
  Status,
} from "@/lib/models";
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
      include: [
        {
          model: Item,
          include: [
            {
              model: ItemShare,
              as: "shares",
              where: { userId: user.id },
              attributes: [],
            },
          ],
          attributes: [],
        },
        Revision,
        {
          model: CategoryArchive,
          as: "archives",
          include: [Revision],
        },
      ],
      where: {
        [Op.or]: [
          // Used by this user (via ItemShare)
          { "$Items.shares.user_id$": user.id },
          // Category revision by this user
          { "$Revision.rev_by$": user.id },
          // Archive revision by this user
          { "$archives.Revision.rev_by$": user.id },
        ],
      },
      order: [[fn("LOWER", col("Category.description")), "ASC"]],
    }),
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
