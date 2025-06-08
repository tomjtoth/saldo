import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Spotify from "next-auth/providers/spotify";

const TESTING_E2E = process.env.AUTH_CREDS_ONLY === "true";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: !TESTING_E2E
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
              name: "Dev Tester",
              image: (email as string).includes("withImage")
                ? "https://avatar.iran.liara.run/public"
                : undefined,
            } as User;
          },
        }),
      ],
  callbacks: {
    async signIn(params) {
      // email must be defined on the profile
      return TESTING_E2E ? true : !!params.profile?.email;
    },
  },
});
