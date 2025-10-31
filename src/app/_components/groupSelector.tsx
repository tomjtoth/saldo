"use client";

import { useEffect, useRef } from "react";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";

import SvgLink from "@/app/_components/svgLink";

export default function GroupSelector() {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();

  const spanRef = useRef<HTMLSpanElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (spanRef.current && selectRef.current) {
      const width = spanRef.current.offsetWidth;
      selectRef.current.style.width = `${width + 20}px`;
    }
  }, [rs.groupId]);

  return rs.groups.length === 0 ? null : (
    <div className="inline-block rounded border">
      <span ref={spanRef} className="invisible absolute px-2">
        {rs.group?.name}
      </span>
      <select
        ref={selectRef}
        className="cursor-pointer p-2"
        id="group-selector"
        value={rs.groupId}
        onChange={(ev) => dispatch(red.setGroupId(Number(ev.target.value)))}
      >
        {rs.groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
      <SvgLink href={`/groups/${rs.groupId}`} className="mx-1" />
    </div>
  );
}
