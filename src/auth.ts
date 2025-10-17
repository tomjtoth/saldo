import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Spotify from "next-auth/providers/spotify";

const PROD =
  process.env.NODE_ENV === "production" && process.env.FORCE_DEV_ENV !== "true";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: PROD
    ? [Discord, GitHub, Google, Spotify]
    : [
        Credentials({
          name: "Creds",
          credentials: {
            email: {
              id: "email",
            },
            password: {
              id: "passwd",
              type: "password",
            },
          },
          authorize: ({ email, password }) => {
            if (password !== "TEST_PASSWD") return null;

            return {
              email,
              name: (email as string).replace(/@.+/, ""),
              image: (email as string).includes("withImage")
                ? "/globe.svg"
                : undefined,
            } as User;
          },
        }),
      ],
  callbacks: {
    async signIn(params) {
      // email must be defined on the profile
      return PROD ? !!params.profile?.email : true;
    },
  },
});
