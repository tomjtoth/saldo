import { signIn, signOut } from "@/auth";

export async function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn();
      }}
    >
      <button type="submit">Sign In</button>
    </form>
  );
}

export async function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit">Sign Out</button>
    </form>
  );
}
