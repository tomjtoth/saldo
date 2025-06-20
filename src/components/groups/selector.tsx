"use client";

import { useEffect } from "react";
import Link from "next/link";

import { TGroup } from "@/lib/models";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";

export default function GroupSelector({ fallback }: { fallback: TGroup[] }) {
  const dispatch = useAppDispatch();

  const groupId = useAppSelector((s) => s.combined.id) ?? fallback.at(0)?.id;
  const groups = useAppSelector((s) => {
    const local = s.combined.groups;
    return local.length > 0 ? local : fallback;
  });

  const group = () => groups.find((group) => group.id === groupId);

  useEffect(() => {
    if (groups.length > 0 && !group()) dispatch(red.setGroupId(groups[0].id));
  }, [groups]);

  return groups.length == 0 ? null : (
    <>
      <div className="inline-block">
        <Link href={`/groups/${groupId}`} className="absolute">
          {(group() ?? groups[0]).name}
        </Link>{" "}
        <select
          id="group-selector"
          className="cursor-pointer -z-1"
          value={groupId}
          onChange={(ev) => dispatch(red.setGroupId(Number(ev.target.value)))}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
