"use client";

import { apiSignOut } from "@/app/api/auth/_lib";
import { useBodyNodes, useClientState } from "@/app/_lib/hooks";

import Canceler from "./canceler";
import UserColorPicker from "./userColorPicker";
import UserAvatar from "./userAvatar";

export default function UserMenu() {
  const user = useClientState().user;
  const nodes = useBodyNodes();

  return (
    <Canceler onClick={nodes.pop}>
      <div
        className={
          "absolute z-2 top-1/2 left-1/2 -translate-1/2 " +
          "p-2 bg-background border rounded flex flex-col gap-2 items-center"
        }
      >
        <div className="flex p-2 gap-2 items-center">
          <UserAvatar user={user!} className="w-10 h-10" />
          <div>
            Hi, {user?.name}!
            <br />
            {user?.email}
          </div>
        </div>

        <UserColorPicker
          name="your color in charts"
          color={user!.color}
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
    </Canceler>
  );
}
