"use client";

import { useState } from "react";

import SignInBtn from "./sign-in";
import SignOutBtn from "./sign-out";
import { useSession } from "next-auth/react";

export default function UserAvatar() {
  const [visible, setVisible] = useState(false);

  const sess = useSession().data;

  if (!sess) return <SignInBtn />;

  const names = (sess.user?.name ?? "").split(" ")!;
  const initials =
    names.length > 1
      ? names?.map((n) => n.slice(0, 1).toUpperCase()).join("")
      : names[0].slice(0, 2).toUpperCase();

  console.log(initials);
  const avatar = sess?.user?.image ? (
    <img src={sess?.user?.image} alt="User Avatar" draggable={false} />
  ) : (
    <svg xmlns="">
      <rect width={200} height={200} fill="red"></rect>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="20"
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        {initials}
      </text>
    </svg>
  );

  return (
    <div>
      <div
        onClick={() => setVisible(!visible)}
        className="w-12 h-12 overflow-hidden border-2 inline-block my-4 rounded-[50%] *:w-full *:h-full *:object-cover"
      >
        {avatar}
      </div>
      <div>
        Hi, {sess?.user?.name}! ({sess?.user?.email})
        <SignOutBtn />
      </div>
    </div>
  );
}
