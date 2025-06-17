"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { useAppDispatch } from "@/lib/hooks";
import { User } from "@/lib/models";
import { rGroups } from "@/lib/reducers/groups";
import { err, sendJSON, toastifyMsgs } from "@/lib/utils";

import Slider from "@/components/slider";

export default function Individual({
  user,
  isAdmin,
  groupId,
}: {
  user: User;
  isAdmin: boolean;
  groupId: number;
}) {
  const dispatch = useAppDispatch();
  const [statusId, setStatusId] = useState(user.Membership!.statusId);

  return (
    <li
      className={
        "flex gap-1 items-center rounded border-2 " +
        (statusId == 1 ? "border-green-500" : "border-red-500")
      }
    >
      {user.Membership?.admin ? (
        <span>👮</span>
      ) : (
        isAdmin && (
          <Slider
            checked={statusId == 1}
            onClick={() => {
              const prevStatusId = statusId;
              const nextStatusId = 1 + (statusId % 2);
              setStatusId(nextStatusId);

              toast.promise(
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
                    console.log(res);
                    if (!res.ok) err();

                    const body = await res.json();
                    dispatch(rGroups.updateMembership(body));
                  })
                  .catch((res) => {
                    console.error(res);
                    setStatusId(prevStatusId);
                    err();
                  }),
                toastifyMsgs(
                  `${nextStatusId == 1 ? "Allowing" : "Banning"} "${user.name}"`
                )
              );
            }}
          />
        )
      )}{" "}
      {user.name} ({user.email})
    </li>
  );
}
