"use client";

import Link from "next/link";
import { useState } from "react";

import { LINKS } from "./config";
import { CANCELER_CLASSES } from "..";

const hrefToLabel = (href: string) => href.replaceAll(/[^\w]+/g, "");

export default function Sidepanel() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <nav
        className={`absolute z-2 top-0 h-full w-[85vw] sm:w-60  ${
          visible ? "left-0" : "-left-[85vw] -sm:left-60"
        } duration-150 border-r bg-background p-4`}
      >
        <ul>
          {LINKS.map((a) => (
            <li key={a.href}>
              <Link href={a.href} onClick={() => setVisible(false)}>
                {a.label ?? hrefToLabel(a.href)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {visible && (
        <div
          className={CANCELER_CLASSES}
          onClick={(ev) => {
            if (ev.target === ev.currentTarget) setVisible(false);
          }}
        />
      )}
      <button id="sidepanel-opener" onClick={() => setVisible(true)}>
        ≡
      </button>
    </>
  );
}
