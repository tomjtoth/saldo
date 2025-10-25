"use client";

import { ReactNode, useState } from "react";

import { svcSignIn } from "@/lib/services/auth";
import { useRootDivCx } from "./rootDiv";

import Sidepanel from "./sidepanel";
import UserAvatar from "./userAvatar";

export default function Header({
  children,
  className: cn = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const { user } = useRootDivCx();

  function hide() {
    setVisible(false);
  }

  return (
    <>
      <Sidepanel {...{ visible, hide }} />

      <header className="flex gap-2 p-2 items-center">
        {!!user ? (
          <div
            id="sidepanel-opener"
            className="relative w-12 h-12 cursor-pointer"
            onClick={() => setVisible(true)}
          >
            <UserAvatar {...user} />

            <div
              className={
                "absolute -bottom-2 -right-2 bg-background h-6 w-6 " +
                "rounded-[35%] border text-center cursor-pointer"
              }
            >
              ☰
            </div>
          </div>
        ) : (
          <button id="sign-in-button" onClick={svcSignIn}>
            Sign In To
          </button>
        )}

        <div className={`grow ${cn}`}>{children}</div>
      </header>
    </>
  );
}
