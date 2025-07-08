import { auth } from "@/auth";

import CliSidepanel from "./clientSide";
import { SignInButton, SignOutButton } from "./buttons";

export default async function Sidepanel() {
  const session = await auth();

  const name = session?.user?.name;
  const email = session?.user?.email;
  const image = session?.user?.image;

  const names = (name ?? "").split(" ")!;

  const avatar = image ? (
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

  const greeter = (
    <p>
      Hi, {name ?? "XYou"}!
      {email && (
        <>
          <br />({email})
        </>
      )}
    </p>
  );

  return (
    <CliSidepanel
      {...{
        authenticated: !!session,
        signInButton: <SignInButton />,
        signOutButton: <SignOutButton />,
        avatar,
        greeter,
      }}
    />
  );
}
