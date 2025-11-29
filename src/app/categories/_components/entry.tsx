"use client";

import { useEffect } from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { virt } from "@/app/_lib/utils";
import { Category } from "../_lib";
import { thunks } from "@/app/_lib/reducers";

import SvgStar from "@/app/_components/star";
import Details from "./details";

export default function Entry({
  categoryId,
  defaultId,
  preSelected,
}: {
  categoryId: Category["id"];
  defaultId?: Category["id"] | null;
  preSelected: boolean;
}) {
  const nodes = useBodyNodes();
  const dispatch = useAppDispatch();
  const category = useClientState("category", categoryId)!;

  const isDefault = defaultId === category.id;

  useEffect(() => {
    if (preSelected) nodes.push(Details, { categoryId });
  }, []);

  return (
    <div
      className={
        "cursor-pointer select-none text-center p-2 rounded border-2 " +
        (virt(category).active ? "border-green-500" : "border-red-500")
      }
      onClick={() => nodes.push(Details, { categoryId })}
    >
      <SvgStar
        fill={isDefault ? "#FB0" : "#AAA"}
        onClick={
          isDefault
            ? undefined
            : (ev) => {
                ev.stopPropagation();
                dispatch(
                  thunks.setDefaultCategoryId(
                    category.id,
                    category.groupId,
                    defaultId
                  )
                );
              }
        }
      />{" "}
      {category.name}
    </div>
  );
}
