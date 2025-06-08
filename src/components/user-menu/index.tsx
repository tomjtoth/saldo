"use server";

import { auth } from "@/auth";

import CliUserMenu from "./client-side";
import { SignInButton, SignOutButton } from "./buttons";

export default async function UserMenu() {
  const session = await auth();

  const name = session?.user?.name;
  const email = session?.user?.email;
  const image = session?.user?.image;

  const names = (name ?? "").split(" ")!;

  const srvAvatar = image ? (
    <img src={image} alt="User Avatar" draggable={false} />
  ) : (
    <svg xmlns="">
      <rect width={200} height={200} fill="red"></rect>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontFamily="sans-serif"
        fontWeight="bold"
        className="select-none"
      >
        {names.length > 1
          ? names?.map((n) => n.slice(0, 1).toUpperCase()).join("")
          : names[0].slice(0, 2).toUpperCase()}
      </text>
    </svg>
  );

  const srvMenu = (
    <div className="z-2 absolute border rounded bg-background shadow-lg p-4 right-2 top-15">
      <p>
        Hi, {name ?? "XYou"}!
        {email && (
          <>
            <br />({email})
          </>
        )}
      </p>

      <SignOutButton />
    </div>
  );

  const signInButton = <SignInButton />;

  return (
    <CliUserMenu
      {...{
        authenticated: !!session,
        signInButton,
        srvAvatar,
        srvMenu,
      }}
    />
  );
}
