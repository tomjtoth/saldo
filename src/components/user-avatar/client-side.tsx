"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";

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
  const [open, setOpen] = useState(false);

  return (
    <div className="z-2 float-right">
      <>
        {authenticated ? (
          <>
            <div
              className="w-10 h-10 overflow-hidden border-2 inline-block rounded-[50%] *:w-full *:h-full [&_img]:object-cover cursor-pointer"
              onClick={() => setOpen((v) => !v)}
            >
              {avatar}
            </div>
            {open && (
              <div className="absolute border rounded bg-background shadow-lg p-4 mt-2 right-2">
                <p>
                  Hi, {name}!
                  <br />({email})
                </p>
                <button onClick={() => signOut()}>Sign out</button>
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
