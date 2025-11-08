"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { apiSignIn } from "@/app/api/auth/_lib";
import { useBodyNodes, useClientState, useRootDivCx } from "@/app/_lib/hooks";

import UserAvatar from "./userAvatar";
import UserMenu from "./userMenu";
import GroupSelector from "./groupSelector";
import ViewSelector from "./viewSelector";

export default function Header({
  children,
  className: cn = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const nodes = useBodyNodes();
  const { user } = useRootDivCx();
  const cs = useClientState();

  const pathname = usePathname();

  return (
    <>
      <header className="flex gap-2 p-2 items-center">
        {!!user ? (
          <>
            <UserAvatar
              {...{
                user,
                id: "usermenu-opener",
                className: "w-12 h-12 cursor-pointer",
                onClick: () => nodes.push(UserMenu),
              }}
            />
            <GroupSelector />
            <ViewSelector />
          </>
        ) : (
          <>
            <button id="sign-in-button" onClick={apiSignIn}>
              Sign In To
            </button>
            Saldo
          </>
        )}

        <div className={`grow ${cn}`}>{children}</div>
      </header>

      {pathname !== "/" && cs.groups.length === 0 && (
        <p>
          You have no access to active groups currently,{" "}
          <Link href="/groups">create or enable one</Link>!
        </p>
      )}
    </>
  );
}
