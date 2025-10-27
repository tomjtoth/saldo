"use server";

import { signIn, signOut } from "@/auth";

export const svcSignIn = async () => {
  await signIn();
};

export const svcSignOut = async () => {
  await signOut({ redirectTo: "/" });
};
