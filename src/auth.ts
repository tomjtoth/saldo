import NextAuth from "next-auth";
// import SequelizeAdapter from "@auth/sequelize-adapter";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Spotify from "next-auth/providers/spotify";

import { User } from "./lib/models";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Discord, GitHub, Google, Spotify],
  // adapter: SequelizeAdapter(db),
  callbacks: {
    async signIn(params) {
      const email = params.profile?.email!;
      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({ email, name: "some1 new" });
      }
      return true;
    },
  },
});
