import { signIn, signOut } from "@/auth";

export const SignInBtn = () => (
  <form
    action={async () => {
      "use server";
      await signIn();
    }}
  >
    <button type="submit">Sign in</button>
  </form>
);

export const SignOutBtn = () => (
  <form
    action={async () => {
      "use server";
      await signOut();
    }}
  >
    <button type="submit">Sign Out</button>
  </form>
);
