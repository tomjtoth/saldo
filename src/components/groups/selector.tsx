"use client";

import { useEffect, useRef } from "react";

import { TGroup } from "@/lib/models";
import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";

import SvgLink from "../svg-link";

export default function GroupSelector({ fallback }: { fallback: TGroup[] }) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector(fallback);

  const spanRef = useRef<HTMLSpanElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (spanRef.current && selectRef.current) {
      const width = spanRef.current.offsetWidth;
      selectRef.current.style.width = `${width + 20}px`;
    }
  }, [rs.groupId]);

  return rs.groups.length === 0 ? null : (
    <div className="inline-block">
      <span ref={spanRef} className="invisible absolute px-2">
        {rs.group?.name}
      </span>
      <select
        ref={selectRef}
        className="cursor-pointer rounded border p-2 mr-1"
        value={rs.groupId}
        onChange={(ev) => dispatch(red.setGroupId(Number(ev.target.value)))}
      >
        {rs.groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
      <SvgLink href={`/groups/${rs.groupId}`} />
    </div>
  );
}
