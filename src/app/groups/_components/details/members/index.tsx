"use client";

import { TGroup } from "@/app/_lib/db";

import Individual from "./individual";

export default function Members({
  clientIsAdmin,
  ...group
}: TGroup & { clientIsAdmin: boolean }) {
  return (
    <>
      <h3>Current members</h3>
      <p className="text-center">
        Any active member can see any other member regardless of their status.
        Banned members cannot access the group or see its members, unless
        re-instated by an admin.
      </p>
      <ul className="flex flex-wrap gap-2 justify-center *:p-1">
        {group.memberships!.map((ms) => (
          <Individual
            key={ms.user!.id!}
            {...{ ...ms, groupId: group.id, clientIsAdmin }}
          />
        ))}
      </ul>
    </>
  );
}
