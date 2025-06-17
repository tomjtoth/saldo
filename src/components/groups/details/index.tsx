"use client";

import { TGroup } from "@/lib/models";

import Invitation from "./invitation";
import Title from "./title";
import Members from "./members";

export default function Details({ group }: { group: TGroup }) {
  const isAdmin = group.Memberships![0].admin;

  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "max-w-min sm:max-w-4/5 max-h-4/5 overflow-scroll " +
        "rounded border-2 " +
        (group.statusId === 1 ? "border-green-500" : "border-red-500") +
        " p-2 flex flex-col items-center flex-wrap gap-2"
      }
    >
      <Title {...{ group }} />

      <Members {...{ group }} />

      <Invitation {...{ group }} />
    </div>
  );
}
