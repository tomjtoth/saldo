import Image from "next/image";

import { User } from "../(users)/_lib";
import { useClientState } from "../_lib/hooks";

export default function UserAvatar({
  id,
  className = "",
  onClick,
  ...source
}: {
  userId?: User["id"];
  id?: string;
  className?: string;
  onClick?: () => void;
}) {
  const user =
    "userId" in source
      ? useClientState("users").find((u) => u.id === source.userId)
      : useClientState("user");

  const names = (user?.name ?? "").split(" ");
  const svgName =
    names.length > 1
      ? names.map((n) => n.slice(0, 1).toUpperCase()).join("")
      : names[0].slice(0, 2).toUpperCase();

  const classes =
    className +
    " overflow-hidden shrink-0 object-cover " +
    "rounded-full border-2 border-foreground inline-block aspect-square";

  return user?.image ? (
    <Image
      {...{ id, onClick }}
      unoptimized
      className={classes}
      height={96}
      width={96}
      src={user.image}
      alt={`avatar of ${user.name ?? "someone"}`}
      draggable={false}
    />
  ) : (
    <svg xmlns="" className={classes} {...{ onClick, id }}>
      <rect width={96} height={96} fill="red" />

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
        {svgName}
      </text>
    </svg>
  );
}
