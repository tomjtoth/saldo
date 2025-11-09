"use client";

import { apiSignOut } from "@/app/api/auth/_lib";
import { useBodyNodes, useClientState } from "@/app/_lib/hooks";

import UserColorPicker from "./userColorPicker";
import Link from "next/link";

export default function UserMenu() {
  const cs = useClientState();
  const nodes = useBodyNodes();

  return (
    <div className="flex flex-col p-2 gap-2 items-start">
      <span>Hi, {cs.user?.name}!</span>
      <span>{cs.user?.email}</span>

      <span>
        Go to 👨‍👨‍👦‍👦 <Link href="/groups">group settings</Link>.
      </span>

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
