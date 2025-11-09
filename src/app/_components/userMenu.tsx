"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { apiSignOut } from "@/app/api/auth/_lib";
import { useBodyNodes, useClientState } from "@/app/_lib/hooks";

import UserColorPicker from "./userColorPicker";

export default function UserMenu() {
  const cs = useClientState();
  const nodes = useBodyNodes();
  const pathname = usePathname();

  return (
    <div className="flex flex-col p-2 gap-2 items-start">
      <span>Hi, {cs.user?.name}!</span>
      <span>{cs.user?.email}</span>

      {pathname !== "/groups" && (
        <span>
          Go to 👨‍👨‍👦‍👦 <Link href="/groups">group settings</Link>
        </span>
      )}

      {pathname !== "/" && (
        <span>
          View <Link href="/">about</Link> page
        </span>
      )}

      <UserColorPicker
        name="Set your color in charts"
        color={cs.user!.color}
        setLabelColor
      />
      <button
        id="sign-out-button"
        className="mt-2"
        onClick={() => {
          nodes.pop();
          apiSignOut();
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
