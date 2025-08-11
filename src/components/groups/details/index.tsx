"use client";

import { useEffect, useState } from "react";

import { TGroup } from "@/lib/db";
import { status } from "@/lib/utils";

import Invitation from "./invitation";
import Title from "./title";
import Members from "./members";
import SvgLink from "@/components/svgLink";
import { useGroupSelector } from "@/lib/hooks";

export default function Details({ group }: { group: TGroup }) {
  const [statusId, setStatusId] = useState(group.statusId!);
  const rs = useGroupSelector();
  const clientIsAdmin = group.memberships!.some(
    (ms) => ms.user!.id === rs.userId && status(ms).admin
  );

  useEffect(() => {
    setStatusId(group.statusId!);
  }, [group.statusId]);

  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "max-w-min sm:max-w-4/5 max-h-4/5 overflow-scroll " +
        "bg-background rounded border-2 " +
        (status({ statusId }).active ? "border-green-500" : "border-red-500") +
        " p-2 flex flex-col items-center gap-2"
      }
    >
      <Title {...{ group, statusId, setStatusId, clientIsAdmin }} />

      <Members {...{ ...group, clientIsAdmin }} />

      <Invitation {...{ group, clientIsAdmin }} />

      {status(group).active && (
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
