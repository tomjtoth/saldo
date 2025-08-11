"use client";

import { useEffect, useState } from "react";

import { TGroup } from "@/lib/models";

import Invitation from "./invitation";
import Title from "./title";
import Members from "./members";
import SvgLink from "@/components/svgLink";

export default function Details({ group }: { group: TGroup }) {
  const [statusId, setStatusId] = useState(group.statusId);

  useEffect(() => {
    setStatusId(group.statusId);
  }, [group.statusId]);

  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "max-w-min sm:max-w-4/5 max-h-4/5 overflow-scroll " +
        "bg-background rounded border-2 " +
        (statusId === 1 ? "border-green-500" : "border-red-500") +
        " p-2 flex flex-col items-center gap-2"
      }
    >
      <Title {...{ group, statusId, setStatusId }} />

      <Members {...{ group }} />

      <Invitation {...{ group }} />

      {group.statusId == 1 && (
        <>
          <h3>
            Categories <SvgLink href={`/groups/${group.id}/categories`} />
          </h3>

          <h3>
            Receipts <SvgLink href={`/groups/${group.id}/receipts`} />
          </h3>

          <h3>
            Balance <SvgLink href={`/groups/${group.id}/balance`} />
          </h3>

          <h3>
            Pareto <SvgLink href={`/groups/${group.id}/pareto`} />
          </h3>
        </>
      )}
    </div>
  );
}
