"use client";

import { ChangeEventHandler } from "react";

import { TGroup } from "@/lib/models";

export default function GroupSelector({
  groups,
  value,
  onChange,
}: {
  groups: TGroup[];
  value: number;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <select {...{ value, onChange }}>
      {groups.map((group) => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
    </select>
  );
}
