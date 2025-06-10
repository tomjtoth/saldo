"use server";

import { PropsWithChildren } from "react";

import Sidepanel from "./sidepanel";
import UserMenu from "./user-menu";

export default async function Header({
  children,
  className: cn,
}: PropsWithChildren & { className?: string }) {
  return (
    <header className="flex gap-2 p-2 items-center">
      <Sidepanel />
      <div className={`grow${cn ? ` ${cn}` : ""}`}>{children}</div>
      <UserMenu />
    </header>
  );
}
