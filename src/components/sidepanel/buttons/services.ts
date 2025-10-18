"use server";

import * as auth from "@/auth";

export const svcSignIn = async () => {
  await auth.signIn();
};

export const svcSignOut = async () => {
  await auth.signOut({ redirectTo: "/" });
};
