"use client";

import { useState } from "react";

import { useAppDispatch } from "@/lib/hooks";
import { TUser } from "@/lib/models";
import { rCombined as red } from "@/lib/reducers";
import { err, sendJSON, appToast } from "@/lib/utils";

import Slider from "@/components/slider";

export default function Individual({
  user,
  isAdmin,
  groupId,
}: {
  user: TUser;
  isAdmin?: boolean;
  groupId: number;
}) {
  const dispatch = useAppDispatch();
  const [statusId, setStatusId] = useState(user.Membership!.statusId);

  return (
    <li
      className={
        "flex gap-1 items-center rounded border-2 " +
        (statusId === 1 ? "border-green-500" : "border-red-500")
      }
    >
      {user.Membership?.admin ? (
        <span>👮</span>
      ) : (
        isAdmin && (
          <Slider
            checked={statusId === 1}
            onClick={() => {
              const prevStatusId = statusId;
              const nextStatusId = 1 + (statusId % 2);
              setStatusId(nextStatusId);

              appToast.promise(
                sendJSON(
                  `/api/memberships`,
                  {
                    groupId,
                    userId: user.id,
                    statusId: nextStatusId,
                  },
                  { method: "PUT" }
                )
                  .then(async (res) => {
                    if (!res.ok) err(res.statusText);

                    const body = await res.json();
                    dispatch(red.updateMS(body));
                  })
                  .catch((err) => {
                    setStatusId(prevStatusId);
                    throw err;
                  }),
                `${nextStatusId === 1 ? "Re-instating" : "Banning"} "${
                  user.name
                }"`
              );
            }}
          />
        )
      )}{" "}
      {user.name} ({user.email})
    </li>
  );
}
