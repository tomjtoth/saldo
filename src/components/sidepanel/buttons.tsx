import { signIn, signOut } from "@/auth";

export async function SignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn();
      }}
    >
      <button type="submit" id="sign-in-button">
        Sign In To
      </button>
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
      <button type="submit" id="sign-out-button">
        Sign Out
      </button>
    </form>
  );
}
