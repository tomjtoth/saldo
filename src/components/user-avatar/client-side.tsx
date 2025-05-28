"use client";
import { useState } from "react";

export default function UserAvatarClient({
  authenticated,
  SignInBtn,
  SignOutBtn,
  avatar,
  name,
  email,
}: {
  authenticated: boolean;
  SignInBtn: React.ReactNode;
  SignOutBtn: React.ReactNode;
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
              <div className="absolute bg-white shadow-lg p-4 mt-2 right-0">
                <p>
                  Hi, {name}!
                  <br />({email})
                </p>
                {SignOutBtn}
              </div>
            )}
          </>
        ) : (
          SignInBtn
        )}
      </>
    </div>
  );
}
