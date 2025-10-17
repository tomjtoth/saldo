"use client";

import { useState } from "react";

import { useAppDispatch } from "@/lib/hooks";
import { TMembership } from "@/lib/db";
import { rCombined as red } from "@/lib/reducers";
import { virt } from "@/lib/utils";

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

              dispatch(
                red.updateMembership(
                  ms.groupId!,
                  ms.user!.id!,
                  nextState,
                  `${
                    virt({ flags: nextState }).active
                      ? "Re-instating"
                      : "Banning"
                  } "${ms.user!.name}"`
                )
              ).catch(() => {
                setFlags(prevState);
              });
            }}
          />
        )
      )}{" "}
      {ms.user!.name} ({ms.user!.email})
    </li>
  );
}
