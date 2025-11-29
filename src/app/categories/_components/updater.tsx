"use client";

import { useState } from "react";

import { virt } from "@/app/_lib/utils";
import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { Category } from "../_lib";
import { thunks } from "@/app/_lib/reducers";

import Slider from "@/app/_components/slider";

export default function CategoryUpdater({
  categoryId,
}: {
  categoryId: Category["id"];
}) {
  const dispatch = useAppDispatch();
  const category = useClientState("category", categoryId)!;

  const [name, setName] = useState(category.name);
  const [description, setDescr] = useState(category.description ?? "");
  const [flags, setFlags] = useState(category.flags);

  return (
    <form
      id="updater"
      key={`${category.id}-${category.revisionId}`}
      className={
        "p-2 bg-background rounded border-2 " +
        (virt({ flags }).active ? "border-green-500" : "border-red-500") +
        " grid items-center gap-2 grid-cols-[min-width_min-width_min-width]"
      }
      onSubmit={(ev) => {
        ev.preventDefault();

        dispatch(
          thunks.modCategory(category, { name, description, flags })
        ).catch(() => {
          setName(category.name);
          setDescr(category.description ?? "");
          setFlags(category.flags);
        });
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
        <sub> {category.revision.createdAt} </sub>
        🪪
        <sub> {category.revision.createdBy.name} </sub>
      </div>
    </form>
  );
}
