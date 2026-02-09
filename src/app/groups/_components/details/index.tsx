"use client";

import { useMemo, useState } from "react";

import { Group } from "../../_lib";
import { vf } from "@/app/_lib/utils";
import { useClientState, useDebugger } from "@/app/_lib/hooks";

import Canceler from "@/app/_components/canceler";
import SvgLink from "@/app/_components/svgLink";
import Invitation from "./invitation";
import Title from "./title";
import Members from "./members";

export default function GroupDetails({ groupId }: { groupId: Group["id"] }) {
  const group = useClientState("group", groupId)!;
  const user = useClientState("user");

  const [flags, setFlags] = useState(group.flags);

  const groupIsActive = useMemo(() => vf(group).active, [group]);
  const vFlags = useMemo(() => vf({ flags }, setFlags), [flags]);
  const clientIsAdmin = useMemo(
    () =>
      group.memberships.some((ms) => ms.user.id === user?.id && vf(ms).admin),
    [group.memberships, user?.id]
  );

  useDebugger({
    groupDetails: {
      user,
      memberships: group.memberships,
    },
  });

  return (
    <Canceler classNamesFor={{ children: { border: false } }}>
      <div
        className={
          "overflow-scroll border-2 " +
          "flex flex-col items-center gap-2 " +
          (vFlags.active ? "border-green-500" : "border-red-500")
        }
      >
        <Title {...{ groupId, flags, setFlags, clientIsAdmin }} />

        <Members {...{ groupId, clientIsAdmin }} />

        <Invitation {...{ groupId, clientIsAdmin }} />

        {groupIsActive && (
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
