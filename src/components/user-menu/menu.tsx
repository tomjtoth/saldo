"use client";

import { signOut } from "next-auth/react";

import { useAppSelector } from "@/lib/hooks";

export default function Menu() {
  const closed = useAppSelector((s) => !s.overlay.userMenuOpened);
  const name = useAppSelector((s) => s.overlay.sess.name);
  const email = useAppSelector((s) => s.overlay.sess.email);

  return closed ? null : (
    <div className="z-2 absolute border rounded bg-background shadow-lg p-4 right-2 top-15">
      <p>
        Hi, {name ?? "Stranger"}!
        {email && (
          <>
            <br />({email})
          </>
        )}
      </p>
      <button onClick={() => signOut({ redirectTo: "/" })}>Sign out</button>
    </div>
  );
}
