"use client";

import { useState } from "react";

import { has3WordChars, sendJSON, toastifyMsgs } from "@/lib/utils";
import { TStatus } from "@/lib/models/common";
import { toast } from "react-toastify";

export default function CliCategoryRow({
  id,
  description: originalDescription,
  statusId: originalStatusId,
  statuses,
}: {
  id: number;
  description: string;
  statusId: number;
  statuses: TStatus[];
}) {
  const [buffer, setBuffer] = useState(originalDescription);
  const [descr, setDescr] = useState(originalDescription);
  const [statusId, setStatusId] = useState(originalStatusId);

  return (
    <>
      <form
        className="p-0"
        onSubmit={(ev) => {
          ev.preventDefault();

          try {
            has3WordChars(buffer);
          } catch {
            return toast.error("Must have 3 consecutive word characters");
          }

          toast.promise(
            sendJSON(
              `/api/categories/${id}`,
              {
                description: buffer,
              },
              { method: "PUT" }
            ).then(() => {
              setDescr(buffer);
            }),
            toastifyMsgs(`Renaming "${descr}" to "${buffer}"`)
          );
        }}
      >
        <input
          type="text"
          pattern=".*\w{3,}.*"
          className="w-full min-w-min"
          value={buffer}
          onChange={(ev) => setBuffer(ev.target.value)}
        />
      </form>

      <select
        className="border rounded"
        value={statusId}
        onChange={async (ev) => {
          const asNum = Number(ev.target.value);
          const statusDescr = statuses.find(
            (st) => st.id === asNum
          )!.description;

          const preFetchStatusId = statusId;
          setStatusId(asNum);

          toast.promise(
            sendJSON(
              `/api/categories/${id}`,
              {
                statusId: asNum,
              },
              { method: "PUT" }
            ).catch(() => {
              setStatusId(preFetchStatusId);
              throw Error("tripping toastify??");
            }),
            toastifyMsgs(`Setting "${descr}" to "${statusDescr}"`)
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
