"use client";

import { PropsWithChildren, ReactNode } from "react";

import Sidepanel from "./sidepanel";
import { useRootDivCx } from "./rootDiv/clientSide";

export default function Header({
  children,
  userMenu: userMenuProps,
  className: cn = "",
}: PropsWithChildren & {
  userMenu?: ReactNode;
  className?: string;
}) {
  const userMenuCx = useRootDivCx().userMenu;

  return (
    <header className="flex gap-2 p-2 items-center">
      <Sidepanel />
      <div className={`grow ${cn}`}>{children}</div>
      {userMenuProps ?? userMenuCx}
    </header>
  );
}
