"use client";

import { apiSignOut } from "@/app/api/auth/_lib";
import { useBodyNodes, useRootDivCx } from "@/app/_lib/hooks";

import Canceler from "./canceler";

export default function UserMenu() {
  const { user } = useRootDivCx();
  const nodes = useBodyNodes();

  return (
    <Canceler onClick={nodes.pop}>
      <div className="absolute z-2 top-1/2 left-1/2 -transalte-1/2">
        <p>
          Hi, {user?.name ?? "XYou"}!
          {user?.email && (
            <>
              <br />({user.email})
            </>
          )}
        </p>

        <button
          id="sign-out-button"
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
