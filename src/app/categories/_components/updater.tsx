"use client";

import { useState } from "react";

import { virt } from "@/lib/utils";
import { useAppDispatch } from "@/lib/hooks";
import { TCategory } from "@/lib/db";
import { rCombined as red } from "@/lib/reducers";

import Slider from "@/app/_components/slider";

export default function Updater({ cat }: { cat: TCategory }) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(cat.name!);
  const [description, setDescr] = useState(cat.description ?? "");
  const [flags, setFlags] = useState(cat.flags!);

  return (
    <form
      id="updater"
      key={`${cat.id}-${cat.revisionId!}`}
      className={
        "p-2 bg-background rounded border-2 " +
        (virt({ flags }).active ? "border-green-500" : "border-red-500") +
        " grid items-center gap-2 grid-cols-[min-width_min-width_min-width]"
      }
      onSubmit={(ev) => {
        ev.preventDefault();

        dispatch(red.updateCategory(cat, { name, description, flags })).catch(
          () => {
            setName(cat.name!);
            setDescr(cat.description ?? "");
            setFlags(cat.flags!);
          }
        );
      }}
    >
      <input
        type="text"
        className="w-full min-w-25"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
      />

      <Slider
        checked={virt({ flags }).active}
        onClick={() => virt({ flags }, setFlags).toggle("active")}
      />

      <button>💾</button>

      <textarea
        className="col-span-3 resize-none"
        rows={2}
        value={description ?? ""}
        placeholder="Optional description..."
        onChange={(ev) => setDescr(ev.target.value)}
      />

      <div className="col-span-3 text-center">
        🗓️
        <sub> {cat.revision!.createdAt} </sub>
        🪪
        <sub> {cat.revision!.createdBy!.name} </sub>
      </div>
    </form>
  );
}
