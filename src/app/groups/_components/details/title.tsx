"use client";

import { Dispatch, SetStateAction, useState } from "react";

import { useAppDispatch } from "@/lib/hooks";
import { virt } from "@/lib/utils";
import { TGroup } from "@/lib/db";
import { rCombined as red } from "@/lib/reducers";

import Slider from "@/app/_components/slider";

export default function Title({
  flags,
  setFlags,
  clientIsAdmin,
  group,
}: {
  flags: number;
  setFlags: Dispatch<SetStateAction<number>>;
  clientIsAdmin: boolean;
  group: TGroup;
}) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(group.name!);
  const [description, setDescription] = useState(group.description ?? "");

  function restoreOriginals() {
    setName(group.name!);
    setDescription(group.description ?? "");
    setFlags(group.flags!);
  }

  return clientIsAdmin ? (
    <form
      id="updater"
      className="grid items-center grid-cols-[min-width_min-width_min-width] gap-2"
      onSubmit={(ev) => {
        ev.preventDefault();

        dispatch(
          red.updateGroup(group.id!, { name, description, flags }, group)
        ).catch(restoreOriginals);
      }}
    >
      <input
        type="text"
        className="text-center p-2!"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
      />

      <Slider
        checked={virt({ flags }).active}
        onClick={() => virt({ flags }, setFlags).toggle("active")}
      />

      <button>💾</button>

      <textarea
        className="col-span-3 resize-none text-center"
        value={description ?? ""}
        placeholder="Optional description..."
        onChange={(ev) => setDescription(ev.target.value)}
        rows={2}
      />
    </form>
  ) : (
    <>
      <h2>{group.name}</h2>
      {group.description && <q>{group.description}</q>}
    </>
  );
}
