import { signInAction } from "@/lib/server";

export default function SignInBtn() {
  return (
    <form action={signInAction}>
      <button type="submit">Sign in</button>
    </form>
  );
}
