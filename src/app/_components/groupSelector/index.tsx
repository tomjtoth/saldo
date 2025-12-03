"use client";

import { usePathname } from "next/navigation";

import { useBodyNodes, useClientState } from "@/app/_lib/hooks";

import MainMenu from "../mainMenu";

export default function GroupSelector() {
  const nodes = useBodyNodes();
  const pathname = usePathname();

  const group = useClientState("group");

  return !group || pathname === "/groups" ? null : (
    <>
      <span
        className="truncate cursor-pointer min-w-10 select-none"
        onClick={() => nodes.push(MainMenu)}
      >
        {group.name}
      </span>{" "}
      /{" "}
    </>
  );
}
