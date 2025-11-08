"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

export default function GroupSelector() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const spanRef = useRef<HTMLSpanElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const cs = useClientState();

  useEffect(() => {
    if (spanRef.current && selectRef.current) {
      const width = spanRef.current.clientWidth;

      // TODO: fit perfectly
      // "demo" vs "some very long as name"
      selectRef.current.style.maxWidth = `${width + 20}px`;

      // cannot control this via Tailwind as the <select> has
      // options of different widths
      selectRef.current.style.minWidth = `${Math.min(60, width)}px`;
    }
  }, [cs.groupId]);

  return !cs.groups.length || pathname === "/groups" ? null : (
    <>
      <span ref={spanRef} className="absolute invisible">
        {cs.group?.name}
      </span>
      <select
        id="group-selector"
        className="no-spinner focus:outline-hidden cursor-pointer truncate text-center"
        ref={selectRef}
        value={cs.group?.id ?? -1}
        onChange={(ev) => dispatch(thunks.setGroupId(Number(ev.target.value)))}
      >
        {cs.groups.map((grp) => (
          <option key={grp.id} value={grp.id}>
            {grp.name}
          </option>
        ))}
      </select>{" "}
      /{" "}
    </>
  );
}
