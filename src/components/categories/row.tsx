"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { rCats } from "@/lib/reducers/categories";
import { err, has3WordChars, sendJSON, toastifyMsgs } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { CATEGORIES_INPUT_PROPS } from "./config";

export default function CliCategoryRow({ id }: { id: number }) {
  const statuses = useAppSelector((s) => s.categories.stats);
  const cat = useAppSelector(
    (s) => s.categories.cats.find((cat) => cat.id === id)!
  );
  const dispatch = useAppDispatch();

  const [buffer, setBuffer] = useState(cat?.description ?? "");
  const [statusId, setStatusId] = useState(cat.statusId);

  return (
    <>
      <form
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
              .then((res) => {
                if (!res.ok) err("tripping toastify");

                dispatch(rCats.update({ ...cat, description: buffer }));
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
              `/api/categories/${id}`,
              {
                statusId: asNum,
              },
              { method: "PUT" }
            )
              .then((res) => {
                if (!res.ok) err("tripping toastify");
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
