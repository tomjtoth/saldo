import { signOutAction } from "@/lib/server";

export default function SignOutBtn() {
  return (
    <form action={signOutAction}>
      <button type="submit">Sign Out</button>
    </form>
  );
}
