"use client";

import { TCategory } from "@/lib/models";

import Updater from "./updater";
import Slider from "../slider";

export default function Details({
  cat,
  hideDetails,
}: {
  cat: TCategory;
  hideDetails: () => void;
}) {
  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "max-w-min sm:max-w-full sm:w-4/5 max-h-4/5 " +
        "overflow-scroll p-2 flex justify-center flex-wrap gap-2"
      }
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) hideDetails();
      }}
    >
      <Updater cat={cat} />
      {cat.archives!.toReversed().map((cat) => (
        <div
          key={`${cat.id}-${cat.revId!}`}
          className={
            "p-2 bg-background rounded border-2 cursor-not-allowed " +
            (cat.statusId === 1 ? "border-green-500" : "border-red-500") +
            " grid gap-2 grid-cols-[min-width_min-width]"
          }
        >
          <input
            type="text"
            className="w-full min-w-25 cursor-not-allowed"
            defaultValue={cat.name}
            disabled
          />

          <Slider checked={cat.statusId === 1} className="" />

          {cat.description && (
            <textarea
              className="col-span-2 resize-none cursor-not-allowed"
              rows={2}
              defaultValue={cat.description}
              disabled
            />
          )}

          <div className="col-span-2 text-center row-start-3">
            🗓️
            <sub> {cat.Revision!.revOn} </sub>
            🪪
            <sub> {cat.Revision!.User?.name} </sub>
          </div>
        </div>
      ))}
    </div>
  );
}
