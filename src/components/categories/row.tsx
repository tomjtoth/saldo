"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";

import { rCategories as red } from "@/lib/reducers/categories";
import { err, has3WordChars, sendJSON, toastifyMsgs } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { CATEGORIES_INPUT_PROPS } from "./config";
import { TCategory } from "@/lib/models";

import Canceler from "../Canceler";
import CategoryArchives from "./archives";

export default function CliCategoryRow({ cat }: { cat: TCategory }) {
  const statuses = useAppSelector((s) => s.categories.stats);
  const dispatch = useAppDispatch();

  const [buffer, setBuffer] = useState(cat?.description ?? "");
  const [statusId, setStatusId] = useState(cat.statusId);
  const [showArchives, setShowArchives] = useState(false);

  return (
    <>
      {showArchives && (
        <>
          <Canceler onClick={() => setShowArchives(false)} />
          <CategoryArchives cat={cat} />
        </>
      )}

      <form
        className="category-row flex items-center gap-2"
        onSubmit={(ev) => {
          ev.preventDefault();

          try {
            has3WordChars(buffer);
          } catch {
            return toast.error("Must have 3 consecutive word characters");
          }

          toast.promise(
            sendJSON(
              `/api/categories/${cat.id}`,
              {
                description: buffer,
              },
              { method: "PUT" }
            )
              .then(async (res) => {
                if (!res.ok) {
                  if (res.status === 401)
                    signIn("", { redirectTo: "/categories" });
                  else err("tripping toastify");
                }

                const updated: TCategory = await res.json();

                dispatch(red.update(updated));
              })
              .catch(() => {
                setBuffer(cat.description);
                err("tripping toastify");
              }),
            toastifyMsgs(`Renaming "${cat.description}" to "${buffer}"`)
          );
        }}
      >
        <input
          {...{
            ...CATEGORIES_INPUT_PROPS,
            value: buffer,
            onChange: (ev) => setBuffer(ev.target.value),
          }}
        />
        {(cat.archives?.length ?? 0) > 0 && (
          <button type="button" onClick={() => setShowArchives(true)}>
            🗐
          </button>
        )}
      </form>

      <select
        className="border rounded p-1"
        value={statusId}
        onChange={async (ev) => {
          const asNum = Number(ev.target.value);
          const statusDescr = statuses.find(
            (st) => st.id === asNum
          )!.description;

          const preFetchStatusId = cat.statusId;
          setStatusId(asNum);

          toast.promise(
            sendJSON(
              `/api/categories/${cat.id}`,
              {
                statusId: asNum,
              },
              { method: "PUT" }
            )
              .then(async (res) => {
                if (!res.ok) {
                  if (res.status === 401)
                    signIn("", { redirectTo: "/categories" });
                  else err("tripping toastify");
                }

                const updated: TCategory = await res.json();

                dispatch(red.update(updated));
              })
              .catch(() => {
                setStatusId(preFetchStatusId);
                err("tripping toastify");
              }),
            toastifyMsgs(`Setting "${cat.description}" to "${statusDescr}"`)
          );
        }}
      >
        {statuses.map((st) => (
          <option key={st.id} value={st.id}>
            {st.description}
          </option>
        ))}
      </select>
    </>
  );
}
