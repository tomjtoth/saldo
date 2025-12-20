"use client";

import { useMemo, useState } from "react";

import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { Membership } from "@/app/groups/_lib";
import { thunks } from "@/app/_lib/reducers";
import { virt } from "@/app/_lib/utils";

import Slider from "@/app/_components/slider";

export default function Individual({
  clientIsAdmin,
  userId,
  groupId,
}: {
  clientIsAdmin: boolean;
  userId: Membership["userId"];
  groupId: Membership["groupId"];
}) {
  const dispatch = useAppDispatch();
  const ms = useClientState("group", groupId)!.memberships.find(
    (ms) => ms.userId === userId && ms.groupId === groupId
  )!;

  const [flags, setFlags] = useState(ms.flags);

  const memberControl = `${ms.user.name} (${ms.user.email})`;
  const vMs = useMemo(() => virt(ms), [ms]);
  const vFlags = useMemo(() => virt({ flags }, setFlags), [flags]);

  return (
    <li
      className={
        "flex gap-1 items-center rounded border-2 " +
        (vMs.active ? "border-green-500" : "border-red-500")
      }
    >
      {vMs.admin ? (
        <span className={clientIsAdmin ? "cursor-not-allowed" : undefined}>
          👮 {memberControl}
        </span>
      ) : clientIsAdmin ? (
        <Slider
          checked={vFlags.active}
          onClick={() => {
            const prev = flags;
            const next = vFlags.toggleActive();

            dispatch(
              thunks.modMembership(
                {
                  groupId: ms.groupId,
                  userId: ms.user.id,
                  flags: next,
                },

                `${
                  virt({ flags: next }).active ? "Re-instating" : "Banning"
                } "${ms.user.name}"`
              )
            ).catch(() => {
              setFlags(prev);
            });
          }}
        >
          {memberControl}
        </Slider>
      ) : (
        memberControl
      )}
    </li>
  );
}
