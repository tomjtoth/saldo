"use client";

import { useEffect, useMemo } from "react";

import { Group } from "../_lib";
import { virt } from "@/app/_lib/utils";
import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import SvgStar from "@/app/_components/star";
import GroupDetails from "./details";

export default function GroupEntry({
  groupId,
  preSelected,
}: {
  groupId: Group["id"];
  preSelected?: boolean;
}) {
  const nodes = useBodyNodes();
  const dispatch = useAppDispatch();
  const isDefault = useClientState("user")?.defaultGroupId === groupId;
  const group = useClientState("group", groupId)!;

  const isActive = useMemo(() => virt(group).active, [group.flags]);

  useEffect(() => {
    if (preSelected) nodes.push(GroupDetails, { groupId });
  }, []);

  return (
    <div
      className={
        "cursor-pointer select-none p-2 rounded border-2 " +
        (isActive ? "border-green-500" : "border-red-500")
      }
      onClick={() => nodes.push(GroupDetails, { groupId })}
    >
      <SvgStar
        fill={isDefault ? "#FB0" : "#AAA"}
        onClick={
          isDefault
            ? undefined
            : (ev) => {
                ev.stopPropagation();
                dispatch(thunks.setDefaultGroupId(groupId));
              }
        }
      />{" "}
      {group.name}
    </div>
  );
}
