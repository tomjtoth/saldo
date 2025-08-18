"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";

import { LINKS } from "./config";
import Canceler from "../canceler";
import ChartLineConfig from "../chartLineConfig";

const hrefToLabel = (href: string) => href.replaceAll(/[^\w]+/g, "");

export default function CliSidepanel(srv: {
  authenticated: boolean;
  greeter: ReactNode;
  signInButton: ReactNode;
  signOutButton: ReactNode;
  avatar: ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <div
        className={`absolute z-2 top-0 h-full w-[85vw] sm:w-75  ${
          visible ? "left-0 shadow-lg" : "-left-[85vw] -sm:left-75"
        } duration-150 border-r bg-background p-4`}
      >
        <div className="flex justify-between">
          {srv.greeter}
          {srv.signOutButton}
        </div>
        <ChartLineConfig />
        <hr />
        <ul className="ml-2">
          {LINKS.map((a) => (
            <li key={a.href}>
              <Link href={a.href} onClick={() => setVisible(false)}>
                {a.label ?? hrefToLabel(a.href)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {visible && <Canceler onClick={() => setVisible(false)} />}

      {srv.authenticated ? (
        <div className="relative">
          <div
            id="sidepanel-opener"
            className={
              "w-10 h-10 overflow-hidden cursor-pointer shrink-0 " +
              "rounded-full border-2 inline-block " +
              "*:w-full *:h-full [&_img]:object-cover"
            }
            onClick={() => setVisible(true)}
          >
            {srv.avatar}
          </div>
          <div
            className={
              "absolute -bottom-1 -right-2 bg-background h-6 w-6 " +
              "rounded-[35%] border text-center cursor-pointer"
            }
            onClick={(ev) => {
              ev.stopPropagation();
              setVisible(true);
            }}
          >
            ☰
          </div>
        </div>
      ) : (
        srv.signInButton
      )}
    </>
  );
}
