"use client";

import { TGroup } from "@/lib/models";
import Individual from "./individual";

export default function Members({ group }: { group: TGroup }) {
  const isAdmin = group.Memberships![0].admin;

  return (
    <>
      <h3>Current members</h3>
      <p className="text-center">
        Any active member can see any other member regardless of their status.
        Banned members cannot access the group or see its members, unless
        re-instated by an admin.
      </p>
      <ul className="flex flex-wrap gap-2 justify-center *:p-1">
        {group.Users?.map((user) => (
          <Individual key={user.id} {...{ user, isAdmin, groupId: group.id }} />
        ))}
      </ul>
    </>
  );
}
