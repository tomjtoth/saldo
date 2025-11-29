"use client";

import { useState } from "react";

import { Group } from "../../_lib";
import { virt } from "@/app/_lib/utils";
import { useBodyNodes, useClientState, useDebugger } from "@/app/_lib/hooks";

import Canceler from "@/app/_components/canceler";
import SvgLink from "@/app/_components/svgLink";
import Invitation from "./invitation";
import Title from "./title";
import Members from "./members";

export default function GroupDetails({ groupId }: { groupId: Group["id"] }) {
  const nodes = useBodyNodes();
  const group = useClientState("group", groupId)!;
  const user = useClientState("user");
  const [flags, setFlags] = useState(group.flags);

  const clientIsAdmin = group.memberships.some(
    (ms) => ms.user.id === user?.id && virt(ms).admin
  );

  useDebugger("group details", [user, group.memberships]);

  return (
    <Canceler onClick={nodes.pop}>
      <div
        className={
          "absolute left-1/2 top-1/2 -translate-1/2 " +
          "max-w-min sm:max-w-4/5 max-h-4/5 overflow-scroll " +
          "bg-background rounded border-2 " +
          (virt({ flags }).active ? "border-green-500" : "border-red-500") +
          " p-2 flex flex-col items-center gap-2"
        }
      >
        <Title {...{ groupId, flags, setFlags, clientIsAdmin }} />

        <Members {...{ groupId, clientIsAdmin }} />

        <Invitation {...{ groupId, clientIsAdmin }} />

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
    </Canceler>
  );
}
