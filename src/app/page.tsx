import Link from "next/link";

import SignIn from "@/components/sign-in";

export default function Home() {
  return (
    <>
      <h2>Work in Progress</h2>
      <p>
        This <s className="text-gray-300">is</s> will be a multi-user expense
        tracker app. Go to the <Link href="/import">import view</Link>.
      </p>
      <SignIn />
    </>
  );
}
