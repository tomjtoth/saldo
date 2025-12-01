"use client";

import { useState } from "react";

import { useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { LINKS } from "./viewSelector/listing";

import Canceler from "./canceler";
import UserAvatar from "./userAvatar";
import UserMenu from "./userMenu";
import GroupListing from "./groupSelector/listing";

type Tabs = "personal" | "";

export default function MainMenu(opts: { tab?: Tabs } = {}) {
  const nodes = useBodyNodes();

  const [tab, setTab] = useState<Tabs>(opts.tab ?? "");

  return (
    <Canceler onClick={nodes.pop}>
      <div
        className={
          "absolute block z-2 max-w-9/10 max-h-9/10 " +
          "top-1/2 lg:top-20 left-1/2 lg:left-20 -translate-1/2 lg:translate-0 " +
          "bg-background border rounded flex gap-2 items-stretch"
        }
      >
        <div className="min-w-max flex flex-col p-2 gap-4 items-center border-r">
          <UserAvatar
            className="w-16 h-16 cursor-pointer"
            onClick={() => setTab("personal")}
          />

          <div
            className="overflow-hidden border rounded-xl cursor-pointer"
            onClick={() => setTab("")}
          >
            <table className="border-collapse [&_td]:p-1 select-none">
              <tbody>
                <tr>
                  <td className="border-r">{LINKS[0].emoji}</td>
                  <td className="border-b">{LINKS[1].emoji}</td>
                </tr>
                <tr>
                  <td className="border-t">{LINKS[2].emoji}</td>
                  <td className="border-l">{LINKS[3].emoji}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {tab === "personal" ? <UserMenu /> : <GroupListing />}
      </div>
    </Canceler>
  );
}
