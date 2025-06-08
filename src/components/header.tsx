"use server";

import { PropsWithChildren } from "react";

import Sidepanel from "./sidepanel";
import UserMenu from "./user-menu";

export default async function Header({ children }: PropsWithChildren) {
  return (
    <header className="flex gap-2 p-2 items-center">
      <Sidepanel />
      <div className="grow">{children}</div>
      <UserMenu />
    </header>
  );
}
