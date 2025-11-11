"use client";

import { useEffect, useState } from "react";

import { TGroup } from "@/app/_lib/db";
import { virt } from "@/app/_lib/utils";
import { useClientState } from "@/app/_lib/hooks";

import SvgLink from "@/app/_components/svgLink";
import Invitation from "./invitation";
import Title from "./title";
import Members from "./members";

export default function Details({ group }: { group: TGroup }) {
  const [flags, setFlags] = useState(group.flags!);
  const cs = useClientState();
  const clientIsAdmin = group.memberships!.some(
    (ms) => ms.user!.id === cs.user?.id && virt(ms).admin
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFlags(group.flags!);
  }, [group.flags]);

  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "max-w-min sm:max-w-4/5 max-h-4/5 overflow-scroll " +
        "bg-background rounded border-2 " +
        (virt({ flags }).active ? "border-green-500" : "border-red-500") +
        " p-2 flex flex-col items-center gap-2"
      }
    >
      <Title {...{ group, flags, setFlags, clientIsAdmin }} />

      <Members {...{ ...group, clientIsAdmin }} />

      <Invitation {...{ group, clientIsAdmin }} />

      {virt(group).active && (
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
            Consumption <SvgLink href={`/groups/${group.id}/consumption`} />
          </h3>
        </>
      )}
    </div>
  );
}
