import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Spotify from "next-auth/providers/spotify";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord, GitHub, Google, Spotify],
});
