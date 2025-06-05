"use client";

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";

import { useAppDispatch } from "@/lib/hooks";
import { updateUserSession } from "@/lib/reducers/overlay";

import UserAvatar from "./avatar";
import Menu from "./menu";

export default function UserMenu() {
  const sess = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (sess.status !== "loading") {
      dispatch(
        updateUserSession({
          name: sess.data?.user?.name,
          email: sess.data?.user?.email,
          image: sess.data?.user?.image,
        })
      );
    }
  }, [sess]);

  return sess.status == "loading" ? null : sess.status == "unauthenticated" ? (
    <button onClick={() => signIn()}>Sign in</button>
  ) : (
    <>
      <UserAvatar />
      <Menu />
    </>
  );
}
