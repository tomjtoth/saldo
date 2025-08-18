"use client";

import { TCategory } from "@/lib/db";

import Updater from "./updater";
import Slider from "../slider";
import { status } from "@/lib/utils";

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
      {cat.archives?.map((cat) => (
        <div
          key={`${cat.id}-${cat.revisionId!}`}
          className={
            "p-2 bg-background rounded border-2 cursor-not-allowed " +
            (status(cat).active ? "border-green-500" : "border-red-500") +
            " grid items-center gap-2 grid-cols-[min-width_min-width]"
          }
        >
          <input
            type="text"
            className="w-full min-w-25 cursor-not-allowed"
            defaultValue={cat.name}
            disabled
          />

          <Slider checked={status(cat).active} className="" />

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
            <sub> {cat.revision!.createdAt} </sub>
            🪪
            <sub> {cat.revision!.createdBy!.name} </sub>
          </div>
        </div>
      ))}
    </div>
  );
}
