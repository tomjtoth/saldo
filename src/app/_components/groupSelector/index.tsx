"use client";

import { usePathname } from "next/navigation";

import { useBodyNodes, useGroupSelector } from "@/app/_lib/hooks";

import GroupSelectorListing from "./listing";

export default function GroupSelector() {
  const rs = useGroupSelector();
  const nodes = useBodyNodes();
  const pathname = usePathname();

  return !rs.groups.length || pathname === "/groups" ? null : (
    <>
      <span
        id="group-selector"
        className="inline-block cursor-pointer truncate"
        onClick={() => nodes.push(GroupSelectorListing)}
      >
        {rs.group?.name}
      </span>{" "}
      /{" "}
    </>
  );
}
