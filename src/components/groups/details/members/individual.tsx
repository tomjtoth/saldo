"use client";

import { useState } from "react";

import { useAppDispatch } from "@/lib/hooks";
import { TMembership } from "@/lib/db";
import { rCombined as red } from "@/lib/reducers";
import { appToast, virt } from "@/lib/utils";

import Slider from "@/components/slider";
import { svcUpdateMembership } from "@/lib/services/memberships";

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
        (virt(ms).active ? "border-green-500" : "border-red-500")
      }
    >
      {virt(ms).admin ? (
        <span>👮</span>
      ) : (
        clientIsAdmin && (
          <Slider
            checked={virt({ flags }).active}
            onClick={() => {
              const prevState = flags;
              const nextState = virt({ flags }, setFlags).toggle("active");

              appToast.promise(
                svcUpdateMembership({
                  groupId: ms.groupId,
                  userId: ms.user!.id,
                  flags: nextState,
                })
                  .then(({ flags }) => {
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

                `${
                  virt({ flags: nextState }).active ? "Re-instating" : "Banning"
                } "${ms.user!.name}"`
              );
            }}
          />
        )
      )}{" "}
      {ms.user!.name} ({ms.user!.email})
    </li>
  );
}
