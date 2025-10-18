import { svcSignIn, svcSignOut } from "./services";

export async function SignInButton() {
  return (
    <form action={svcSignIn}>
      <button type="submit" id="sign-in-button">
        Sign In To
      </button>
    </form>
  );
}

export async function SignOutButton() {
  return (
    <form action={svcSignOut}>
      <button type="submit" id="sign-out-button">
        Sign Out
      </button>
    </form>
  );
}
