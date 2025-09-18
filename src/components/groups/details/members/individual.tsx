"use client";

import { useState } from "react";

import { useAppDispatch } from "@/lib/hooks";
import { TMembership } from "@/lib/db";
import { rCombined as red } from "@/lib/reducers";
import { sendJSON, appToast, status } from "@/lib/utils";

import Slider from "@/components/slider";

export default function Individual({
  clientIsAdmin,
  ...ms
}: TMembership & { clientIsAdmin: boolean }) {
  const dispatch = useAppDispatch();
  const [flags, setFlags] = useState(ms.flags!);

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
            checked={status({ flags }).active}
            onClick={() => {
              const prevState = flags;
              const nextState = status({ flags }, setFlags).toggle("active");

              appToast.promise(
                sendJSON(
                  `/api/memberships`,
                  {
                    groupId: ms.groupId,
                    userId: ms.user!.id,
                    flags: nextState,
                  },
                  { method: "PUT" }
                )
                  .then(async (res) => {
                    const { flags }: TMembership = await res.json();

                    dispatch(
                      red.updateMS({
                        flags,
                        groupId: ms.groupId,
                        userId: ms.user!.id,
                      })
                    );
                  })
                  .catch((err) => {
                    setFlags(prevState);
                    throw err;
                  }),

                `${nextState === 0 ? "Re-instating" : "Banning"} "${
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
