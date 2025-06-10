"use client";

import { useEffect } from "react";

import { TCategory, TStatus } from "@/lib/models";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { rCats } from "@/lib/reducers/categories";

import CliCategoryAdder from "./adder";
import CliCategoryRow from "./row";

export function CliCategoriesPage({
  categories,
  statuses,
}: {
  categories: TCategory[];
  statuses: TStatus[];
}) {
  const dispatch = useAppDispatch();
  const cats = useAppSelector((s) => s.categories.cats);

  useEffect(() => {
    if (cats.length === 0)
      dispatch(rCats.init({ cats: categories, stats: statuses }));
  }, []);

  const cn = [
    "p-2 grid gap-2 grid-cols-[auto_min-content]",

    // phone landscape
    "sm:grid-cols-[auto_min-content_auto_min-content]",

    // FullHD desktop
    "lg:grid-cols-[auto_min-content_auto_min-content_auto_min-content]",

    // 2560p desktop
    "2xl:grid-cols-[auto_min-content_auto_min-content_auto_min-content_auto_min-content]",
  ];

  return (
    <div className={cn.join(" ")}>
      {cats.map((cat) => (
        <CliCategoryRow key={cat.id} cat={cat} />
      ))}

      <CliCategoryAdder />
    </div>
  );
}
