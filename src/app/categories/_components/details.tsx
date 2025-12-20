"use client";

import { useMemo } from "react";

import { Category } from "../_lib";
import { virt } from "@/app/_lib/utils";
import { useBodyNodes, useClientState } from "@/app/_lib/hooks";

import Canceler from "@/app/_components/canceler";
import Slider from "@/app/_components/slider";
import CategoryUpdater from "./updater";

export default function CategoryDetails({
  categoryId,
}: {
  categoryId: Category["id"];
}) {
  const nodes = useBodyNodes();
  const category = useClientState("category", categoryId)!;
  const usersO1 = useClientState("users[id]");

  const archiveActiveStateArr = useMemo(
    () => category.archives.map(virt.active),
    [category.archives]
  );

  return (
    <Canceler
      classNamesFor={{ children: { border: false, rounded: false, bg: false } }}
    >
      <div
        className={
          "max-w-min sm:max-w-full sm:w-4/5 " +
          "overflow-scroll flex justify-center flex-wrap gap-2"
        }
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) nodes.pop();
        }}
      >
        <CategoryUpdater {...{ categoryId }} />

        {category.archives.map((cat, idx) => {
          const isActive = archiveActiveStateArr[idx];

          return (
            <div
              key={`${cat.id}-${cat.revisionId}`}
              className={
                "p-2 bg-background rounded border-2 cursor-not-allowed " +
                (isActive ? "border-green-500" : "border-red-500") +
                " grid items-center gap-2 grid-cols-[min-width_min-width]"
              }
            >
              <input
                type="text"
                className="w-full min-w-25 cursor-not-allowed"
                defaultValue={cat.name}
                disabled
              />

              <Slider checked={isActive} className="" />

              {cat.description && (
                <textarea
                  className="col-span-2 resize-none cursor-not-allowed"
                  rows={2}
                  defaultValue={cat.description}
                  disabled
                />
              )}

              <div className="col-span-2 text-center">
                🗓️
                <sub> {cat.revision.createdAt} </sub>
                🪪
                <sub> {usersO1[cat.revision.createdById].name} </sub>
              </div>
            </div>
          );
        })}
      </div>
    </Canceler>
  );
}
