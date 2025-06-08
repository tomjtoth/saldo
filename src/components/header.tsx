"use server";

import { PropsWithChildren } from "react";

import StoreProvider from "@/app/StoreProvider";
import Sidepanel from "./sidepanel";
import Canceler from "./canceler";
import UserMenu from "./user-menu";
import SidepanelOpenerButton from "./sidepanel/button";

export default async function Header({ children }: PropsWithChildren) {
  return (
    <StoreProvider>
      <Canceler />
      <Sidepanel />
      <header className="flex gap-2 p-2 items-center">
        <SidepanelOpenerButton />
        <div className="grow">{children}</div>
        <UserMenu />
      </header>
    </StoreProvider>
  );
}
