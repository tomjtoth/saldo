"use client";

import { PropsWithChildren } from "react";

import Sidepanel from "./sidepanel";
import { useRootDivCx } from "./rootDiv/clientSide";

export default function Header({
  children,
  className: cn = "",
}: PropsWithChildren & {
  className?: string;
}) {
  const userMenu = useRootDivCx().userMenu;

  return (
    <header className="flex gap-2 p-2 items-center">
      <Sidepanel />
      <div className={`grow ${cn}`}>{children}</div>
      {userMenu}
    </header>
  );
}
