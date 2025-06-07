import React from "react";
import { col, fn, Op } from "sequelize";

import { Category, CategoryArchive, Status } from "@/lib/models";

import Header from "@/components/header";
import { CliCategoriesPage } from "@/components/categories";
import StoreProvider from "../StoreProvider";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [cats, statuses] = await Promise.all([
    Category.findAll({
      order: [[fn("LOWER", col("Category.description")), "ASC"]],
      include: [
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
