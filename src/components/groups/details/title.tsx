"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "react-toastify";

import { useAppDispatch } from "@/lib/hooks";
import {
  err,
  has3ConsecutiveLetters,
  sendJSON,
  appToast,
  status,
} from "@/lib/utils";
import { TGroup } from "@/lib/db";
import { rCombined as red } from "@/lib/reducers";

import Slider from "@/components/slider";

export default function Title({
  statusId,
  setStatusId,
  clientIsAdmin,
  group,
}: {
  statusId: number;
  setStatusId: Dispatch<SetStateAction<number>>;
  clientIsAdmin: boolean;
  group: TGroup;
}) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(group.name!);
  const [description, setDescription] = useState(group.description ?? "");

  return clientIsAdmin ? (
    <form
      className="grid items-center grid-cols-[min-width_min-width_min-width] gap-2"
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
              const body = await res.json();
              const ops = appToast.opsDone(group, body);
              dispatch(red.updateGroup(body));

              return `${ops} "${group.name}" succeeded!`;
            })
            .catch((err) => {
              setName(group.name!);
              setDescription(group.description ?? "");
              setStatusId(group.statusId!);
              throw err;
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
        checked={status({ statusId }).active}
        onClick={() => status({ statusId }, setStatusId).toggle("active")}
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
