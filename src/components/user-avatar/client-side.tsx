"use client";

import { signIn, signOut } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { showUserMenu } from "@/lib/reducers/overlay";

export default function UserAvatarClient({
  authenticated,
  avatar,
  name,
  email,
}: {
  authenticated: boolean;
  avatar: React.ReactNode;
  name: string;
  email: string;
}) {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.overlay.userOptsOpened);

  return (
    <div className="float-right">
      <>
        {authenticated ? (
          <>
            <div
              className="w-10 h-10 overflow-hidden border-2 inline-block rounded-[50%] *:w-full *:h-full [&_img]:object-cover cursor-pointer"
              onClick={() => dispatch(showUserMenu())}
            >
              {avatar}
            </div>
            {open && (
              <div className="absolute border rounded bg-background shadow-lg p-4 mt-2 right-2">
                <p>
                  Hi, {name}!
                  <br />({email})
                </p>
                <button onClick={() => signOut({ redirectTo: "/" })}>
                  Sign out
                </button>
              </div>
            )}
          </>
        ) : (
          <button onClick={() => signIn()}>Sign in</button>
        )}
      </>
    </div>
  );
}
