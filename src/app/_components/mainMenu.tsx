"use client";

import { useState } from "react";

import { LINKS } from "./viewSelector/listing";

import Canceler from "./canceler";
import UserAvatar from "./userAvatar";
import UserMenu from "./userMenu";
import GroupListing from "./groupSelector/listing";

type Tabs = "personal" | "";

export default function MainMenu(opts: { tab?: Tabs } = {}) {
  const [tab, setTab] = useState<Tabs>(opts.tab ?? "");
  const shadows = " shadow-[0_0_5px,0_0_15px] shadow-amber-500";

  return (
    <Canceler classNamesFor={{ children: { pad: "" } }}>
      <div className="lg:top-20 lg:left-20 lg:translate-0 flex gap-2 items-stretch">
        <div className="min-w-max flex flex-col p-2 gap-4 items-center border-r">
          <UserAvatar
            className={
              "w-16 h-16 cursor-pointer" + (tab === "personal" ? shadows : "")
            }
            onClick={() => setTab("personal")}
          />

          <div
            className={
              "overflow-hidden border rounded-xl cursor-pointer" +
              (tab === "" ? shadows : "")
            }
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
