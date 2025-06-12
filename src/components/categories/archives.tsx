"use client";

import { TCategory } from "@/lib/models";

export default function CategoryArchives({ cat }: { cat: TCategory }) {
  const cn = [
    "absolute left-1/2 top-1/2 -translate-1/2 md:max-w-7/10 max-h-4/5",
    "p-2 [&_div]:bg-background overflow-scroll",
    "flex flex-wrap gap-2 justify-center items-center",
  ];

  return (
    <div className={cn.join(" ")}>
      {[...cat.archives!, cat].toReversed().map((cat) => (
        <div
          key={`${cat.id}-${cat.revId!}`}
          className={`p-2 border-2 rounded ${
            cat.statusId === 1
              ? "border-green-500"
              : "border-red-500 text-gray-500"
          }`}
        >
          "<code>{cat.description.replaceAll(" ", "·")}</code>" <sub></sub>
          <span>
            🗓️
            <sub> {cat.Revision!.revOn} </sub>
          </span>
          <span>
            🪪
            <sub> {cat.Revision!.User?.name} </sub>
          </span>
        </div>
      ))}
    </div>
  );
}
