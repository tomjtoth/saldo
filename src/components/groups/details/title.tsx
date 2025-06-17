"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";

import { useAppDispatch } from "@/lib/hooks";
import { err, has3WordChars, sendJSON, toastifyPromise } from "@/lib/utils";
import { TGroup } from "@/lib/models";
import { rGroups } from "@/lib/reducers/groups";

import Slider from "@/components/slider";

export default function Title({
  group,
  statusId,
  setStatusId,
}: {
  group: TGroup;
  statusId: number;
  setStatusId: Dispatch<SetStateAction<number>>;
}) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);

  const isAdmin = group.Memberships![0].admin;

  return isAdmin ? (
    <form
      className="grid items-center grid-cols-[min-width_min-width_min-width] gap-2"
      onSubmit={(ev) => {
        ev.preventDefault();
        try {
          has3WordChars(name);
        } catch (res) {
          toast.error(res as string);
        }

        toastifyPromise(
          sendJSON(
            `/api/groups`,
            {
              id: group.id,
              name,
              description,
              statusId,
            },
            { method: "PUT" }
          )
            .then(async (res) => {
              if (!res.ok) err();

              const body = await res.json();

              dispatch(rGroups.update(body));
            })
            .catch(() => {
              setName(group.name);
              setDescription(group.description);
              setStatusId(group.statusId);
              err();
            }),
          `Updating "${group.name}"`
        );
      }}
    >
      <input
        type="text"
        className="text-center p-2!"
        value={name}
        onChange={(ev) => setName(ev.target.value)}
      />

      <Slider
        checked={statusId == 1}
        onClick={() => setStatusId(1 + (statusId % 2))}
      />

      <button>💾</button>

      <textarea
        className="col-span-3 resize-none text-center"
        value={description}
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
