import React from "react";
import { col, fn, Op } from "sequelize";

import { Category, Status } from "@/lib/models";
import CliCategoryRow from "@/components/categories/row";
import CliCategoryAdder from "@/components/categories/adder";

export default async function Categories() {
  const [cats, statuses] = await Promise.all([
    Category.findAll({
      order: [[fn("LOWER", col("Category.description")), "ASC"]],
    }),
    Status.findAll({ where: { id: { [Op.in]: [1, 2] } } }),
  ]);

  return (
    <>
      <h2>Categories</h2>

      <div className="grid grid-cols-[auto_min-content] gap-2">
        {cats.map((cat) => (
          <CliCategoryRow
            key={cat.id}
            {...{
              ...cat.get({ plain: true }),
              statuses: statuses.map((st) => st.get({ plain: true })),
            }}
          />
        ))}

        <CliCategoryAdder />
      </div>
    </>
  );
}
