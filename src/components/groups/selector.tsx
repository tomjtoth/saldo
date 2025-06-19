"use client";

import { ChangeEventHandler } from "react";
import Link from "next/link";

import { TGroup } from "@/lib/models";

export default function GroupSelector({
  groups,
  value,
  onChange,
}: {
  groups: Pick<TGroup, "id" | "name">[];
  value: number;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <>
      <div className="inline-block">
        <Link href={`/groups?id=${value}`} className="absolute">
          {groups.find((grp) => grp.id === value)!.name}
        </Link>{" "}
        <select
          id="group-selector"
          className="cursor-pointer -z-1"
          value={value}
          onChange={onChange}
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
