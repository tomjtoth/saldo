"use client";

import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { hideSidepanel, showSidepanel } from "@/lib/reducers/overlay";

type TLink = {
  href: string;
  label?: string;
};

const LINKS: TLink[] = [
  { href: "/", label: "home" },
  { href: "/import", label: "import from V3" },
  { href: "/categories" },
  { href: "/receipts" },
];

const hrefToLabel = (href: string) => href.replaceAll(/[^\w]+/g, "");

export default function Sidepanel() {
  const dispatch = useAppDispatch();
  const visible = useAppSelector((s) => s.overlay.sidepanelOpened);

  return (
    <>
      <button
        className="z-2 float-start"
        onClick={() => dispatch(showSidepanel())}
      >
        ≡
      </button>
      <nav
        className={`absolute h-full w-[85vw] sm:w-60  ${
          visible ? "left-0" : "-left-[85vw] -sm:left-60"
        } duration-200 border-r bg-background p-4`}
      >
        <ul>
          {LINKS.map((a) => (
            <li key={a.href}>
              <Link href={a.href} onClick={() => dispatch(hideSidepanel())}>
                {a.label ?? hrefToLabel(a.href)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
