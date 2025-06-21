"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { TGroup } from "@/lib/models";
import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";

import Canceler from "../canceler";

export default function GroupSelector({ fallback }: { fallback: TGroup[] }) {
  const dispatch = useAppDispatch();

  const [visible, setVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const rs = useGroupSelector(fallback);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const openDropdown = () => {
    if (linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect();
      setDropdownPos({ left: rect.left, top: rect.bottom });
    }
    setVisible(true);
  };

  if (rs.groups.length === 0) return null;

  return (
    <div className="inline-block">
      <Link ref={linkRef} href={`/groups/${rs.groupId}`}>
        {rs.group?.name}
      </Link>

      <button className="p-1! ml-2" onClick={openDropdown}>
        <div className="-rotate-90">&lt;</div>
      </button>

      {visible && (
        <Canceler onClick={() => setVisible(false)} blur={false}>
          <div
            style={{
              left: dropdownPos?.left,
              top: dropdownPos?.top,
            }}
            className={
              "absolute flex flex-col gap-2 border bg-background " +
              "cursor-default " +
              "*:hover:bg-foreground *:hover:text-background *:p-1"
            }
          >
            {rs.groups.map((group) => (
              <div
                key={group.id}
                onClick={() => {
                  dispatch(red.setGroupId(group.id));
                  setVisible(false);
                }}
              >
                {group.name}
              </div>
            ))}
          </div>
        </Canceler>
      )}
    </div>
  );
}
