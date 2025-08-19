"use client";

import { useState } from "react";

import { useAppDispatch } from "@/lib/hooks";
import { TMembership } from "@/lib/db";
import { rCombined as red } from "@/lib/reducers";
import { err, sendJSON, appToast, status } from "@/lib/utils";

import Slider from "@/components/slider";

export default function Individual({
  clientIsAdmin,
  ...ms
}: TMembership & { clientIsAdmin: boolean }) {
  const dispatch = useAppDispatch();
  const [statusId, setStatusId] = useState(ms.statusId!);

  return (
    <li
      className={
        "flex gap-1 items-center rounded border-2 " +
        (status(ms).active ? "border-green-500" : "border-red-500")
      }
    >
      {status(ms).admin ? (
        <span>👮</span>
      ) : (
        clientIsAdmin && (
          <Slider
            checked={status({ statusId }).active}
            onClick={() => {
              const prevStatusId = statusId;
              const nextStatusId = status({ statusId }, setStatusId).toggle(
                "active"
              );

              appToast.promise(
                sendJSON(
                  `/api/memberships`,
                  {
                    groupId: ms.groupId,
                    userId: ms.user!.id,
                    statusId: nextStatusId,
                  },
                  { method: "PUT" }
                )
                  .then(async (res) => {
                    const { statusId }: TMembership = await res.json();

                    dispatch(
                      red.updateMS({
                        statusId,
                        groupId: ms.groupId,
                        userId: ms.user!.id,
                      })
                    );
                  })
                  .catch((err) => {
                    setStatusId(prevStatusId);
                    throw err;
                  }),

                `${nextStatusId === 0 ? "Re-instating" : "Banning"} "${
                  ms.user!.name
                }"`
              );
            }}
          />
        )
      )}{" "}
      {ms.user!.name} ({ms.user!.email})
    </li>
  );
}
