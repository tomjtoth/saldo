"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { err, has3ConsecutiveLetters, sendJSON, appToast } from "@/lib/utils";
import { useAppDispatch } from "@/lib/hooks";
import { TCategory } from "@/lib/models";
import { rCategories as red } from "@/lib/reducers/categories";

import Slider from "../slider";

export default function Updater({ cat }: { cat: TCategory }) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(cat.name);
  const [description, setDescr] = useState(cat.description);
  const [statusId, setStatusId] = useState(cat.statusId);

  return (
    <form
      id="category-updater-form"
      key={`${cat.id}-${cat.revId!}`}
      className={
        "p-2 bg-background rounded border-2 " +
        (statusId === 1 ? "border-green-500" : "border-red-500") +
        " grid items-center gap-2 grid-cols-[min-width_min-width_min-width]"
      }
      onSubmit={(ev) => {
        ev.preventDefault();

        try {
          has3ConsecutiveLetters(name);
        } catch (err: unknown) {
          return toast.error(
            (err as Error).message as string,
            appToast.theme()
          );
        }

        toast.promise(
          sendJSON(
            `/api/categories/${cat.id}`,
            { name, description, statusId },
            { method: "PUT" }
          )
            .then(async (res) => {
              if (!res.ok) err();

              const body = (await res.json()) as TCategory;

              const operations = [
                ...(body.name !== cat.name ? ["renaming"] : []),
                ...(body.statusId !== cat.statusId ? ["toggling"] : []),
                ...(body.description !== cat.description
                  ? ["altering the description of"]
                  : []),
              ].join(", ");

              dispatch(red.update(body));

              return `${operations[0].toUpperCase() + operations.slice(1)} "${
                cat.name
              }" succeeded!`;
            })
            .catch(() => {
              setName(cat.name);
              setDescr(cat.description);
              setStatusId(cat.statusId);

              err();
            }),
          {
            pending: `Updating "${name}" ...`,
            success: {
              render: ({ data }) => data!,
            },
            error: `Updating "${name}" failed 😭`,
          },
          appToast.theme()
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
        checked={statusId === 1}
        onClick={() => setStatusId(1 + (statusId % 2))}
      />

      <button>💾</button>

      <textarea
        className="col-span-3 resize-none"
        rows={2}
        value={description}
        placeholder="Optional description..."
        onChange={(ev) => setDescr(ev.target.value)}
      />

      <div className="col-span-3 text-center">
        🗓️
        <sub> {cat.Revision!.revOn} </sub>
        🪪
        <sub> {cat.Revision!.User?.name} </sub>
      </div>
    </form>
  );
}
