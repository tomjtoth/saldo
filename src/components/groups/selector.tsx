"use client";

import Link from "next/link";

import { TGroup } from "@/lib/models";
import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";

export default function GroupSelector({ fallback }: { fallback: TGroup[] }) {
  const dispatch = useAppDispatch();

  const rs = useGroupSelector(fallback);

  return rs.groups.length == 0 ? null : (
    <>
      <div className="inline-block">
        <Link href={`/groups/${rs.groupId}`} className="absolute">
          {rs.group?.name}
        </Link>{" "}
        <select
          id="group-selector"
          className="cursor-pointer -z-1"
          value={rs.groupId}
          onChange={(ev) => dispatch(red.setGroupId(Number(ev.target.value)))}
        >
          {rs.groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
