import Image from "next/image";

import { auth } from "../auth";
import SignInBtn from "./sign-in";
import SignOutBtn from "./sign-out";

const FALLBACK_IMG = "";

export default async function UserAvatar() {
  const sess = await auth();

  if (!sess) return <SignInBtn />;

  return (
    <div>
      <Image src={sess?.user?.image ?? FALLBACK_IMG} alt="User Avatar" />
      Hi, {sess?.user?.name}! ({sess?.user?.email})
      <SignOutBtn />
    </div>
  );
}
