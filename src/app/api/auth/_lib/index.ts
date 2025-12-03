"use server";

import { signIn, signOut } from "@/auth";

export async function apiSignIn() {
  await signIn();
}

export async function apiSignOut() {
  await signOut({ redirectTo: "/" });
}
