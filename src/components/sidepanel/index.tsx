"use client";

import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { hideSidepanel } from "@/lib/reducers/overlay";
import { LINKS } from "./config";

const hrefToLabel = (href: string) => href.replaceAll(/[^\w]+/g, "");

export default function Sidepanel() {
  const dispatch = useAppDispatch();
  const visible = useAppSelector((s) => s.overlay.sidepanelOpened);

  return (
    <nav
      className={`absolute h-full w-[85vw] sm:w-60  ${
        visible ? "left-0" : "-left-[85vw] -sm:left-60"
      } duration-150 border-r bg-background p-4`}
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
  );
}
