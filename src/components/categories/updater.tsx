"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import {
  err,
  has3ConsecutiveLetters,
  sendJSON,
  appToast,
  datetimeFromInt,
  status,
} from "@/lib/utils";
import { useAppDispatch } from "@/lib/hooks";
import { TCategory } from "@/lib/db";
import { rCombined as red } from "@/lib/reducers";

import Slider from "../slider";

export default function Updater({ cat }: { cat: TCategory }) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(cat.name!);
  const [description, setDescr] = useState(cat.description ?? "");
  const [statusId, setStatusId] = useState(cat.statusId!);

  return (
    <form
      id="category-updater-form"
      key={`${cat.id}-${cat.revisionId!}`}
      className={
        "p-2 bg-background rounded border-2 " +
        (status({ statusId }).active ? "border-green-500" : "border-red-500") +
        " grid items-center gap-2 grid-cols-[min-width_min-width_min-width]"
      }
      onSubmit={(ev) => {
        ev.preventDefault();

        try {
          has3ConsecutiveLetters(name);
        } catch (err) {
          return toast.error(
            (err as Error).message as string,
            appToast.theme()
          );
        }

        appToast.promise(
          sendJSON(
            "/api/categories",
            {
              id: cat.id,
              groupId: cat.groupId,
              name,
              description: description === "" ? null : description,
              statusId,
            },
            { method: "PUT" }
          )
            .then(async (res) => {
              if (!res.ok) err(res.statusText);

              const body = (await res.json()) as TCategory;

              const operations = [
                ...(body.name !== cat.name ? ["renaming"] : []),
                ...(body.statusId !== cat.statusId ? ["toggling"] : []),
                ...(body.description !== cat.description
                  ? ["altering the description of"]
                  : []),
              ].join(", ");

              dispatch(red.updateCat(body));

              return `${operations[0].toUpperCase() + operations.slice(1)} "${
                cat.name
              }" succeeded!`;
            })
            .catch((err) => {
              setName(cat.name!);
              setDescr(cat.description ?? "");
              setStatusId(cat.statusId!);
              throw err;
            }),
          `Updating "${cat.name}"`
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
        checked={status({ statusId }).active}
        onClick={() => status({ statusId }, setStatusId).toggle("active")}
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
        <sub> {datetimeFromInt(cat.revision!.createdAtInt!)} </sub>
        🪪
        <sub> {cat.revision!.createdBy!.name} </sub>
      </div>
    </form>
  );
}
