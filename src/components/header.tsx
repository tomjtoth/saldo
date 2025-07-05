"use client";

import { PropsWithChildren, ReactNode } from "react";

import Sidepanel from "./sidepanel";
import { useUserMenu } from "./common-context";

export default function Header({
  children,
  userMenu,
  className: cn = "",
}: PropsWithChildren & {
  userMenu?: ReactNode;
  className?: string;
}) {
  if (!userMenu) userMenu = useUserMenu();

  return (
    <header className="flex gap-2 p-2 items-center">
      <Sidepanel />
      <div className={`grow ${cn}`}>{children}</div>
      {userMenu}
    </header>
  );
}
