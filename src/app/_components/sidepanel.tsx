"use client";

import Link from "next/link";

import { svcSignOut } from "@/lib/services/auth";
import { useRootDivCx } from "./rootDiv";

import Canceler from "./canceler";

const hrefToLabel = (href: string) => href.replaceAll(/[^\w]+/g, "");

const LINKS = [
  { href: "/", label: "home" },
  { href: "/groups" },
  { href: "/categories" },
  { href: "/receipts" },
  { href: "/pareto" },
  { href: "/balance" },
];

export default function Sidepanel({
  visible,
  hide,
}: {
  visible: boolean;
  hide: () => void;
}) {
  const { user } = useRootDivCx();

  return !user ? null : (
    <>
      <div
        className={`absolute z-2 top-0 h-full w-[85vw] sm:w-75  ${
          visible ? "left-0 shadow-lg" : "-left-[85vw] -sm:left-75"
        } duration-150 border-r bg-background p-4`}
      >
        <div className="flex justify-between">
          <p>
            Hi, {user?.name ?? "XYou"}!
            {user?.email && (
              <>
                <br />({user.email})
              </>
            )}
          </p>
          <button id="sign-out-button" onClick={svcSignOut}>
            Sign Out
          </button>
        </div>

        <hr />

        <ul className="ml-2">
          {LINKS.map((a) => (
            <li key={a.href}>
              <Link href={a.href} onClick={hide}>
                {a.label ?? hrefToLabel(a.href)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {visible && <Canceler onClick={hide} />}
    </>
  );
}
