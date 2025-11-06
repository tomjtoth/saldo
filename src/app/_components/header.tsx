"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { svcSignIn } from "@/app/_lib/services/auth";
import { useBodyNodes, useGroupSelector, useRootDivCx } from "@/app/_lib/hooks";

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
  const rs = useGroupSelector();

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
            <button id="sign-in-button" onClick={svcSignIn}>
              Sign In To
            </button>
            Saldo
          </>
        )}

        <div className={`grow ${cn}`}>{children}</div>
      </header>

      {pathname !== "/" && rs.groups.length === 0 && (
        <p>
          You have no access to active groups currently,{" "}
          <Link href="/groups">create or enable one</Link>!
        </p>
      )}
    </>
  );
}
