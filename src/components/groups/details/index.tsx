"use client";

import { useState } from "react";

import { TGroup } from "@/lib/models";

import Invitation from "./invitation";
import Title from "./title";
import Members from "./members";

export default function Details({ group }: { group: TGroup }) {
  const [statusId, setStatusId] = useState(group.statusId);

  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "max-w-min sm:max-w-4/5 max-h-4/5 overflow-scroll " +
        "bg-background rounded border-2 " +
        (statusId === 1 ? "border-green-500" : "border-red-500") +
        " p-2 flex flex-col items-center flex-wrap gap-2"
      }
    >
      <Title {...{ group, statusId, setStatusId }} />

      <Members {...{ group }} />

      <Invitation {...{ group }} />
    </div>
  );
}
