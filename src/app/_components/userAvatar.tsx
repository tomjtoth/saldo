import Image from "next/image";

import { TUser } from "@/app/_lib/db";

export default function UserAvatar({
  user: { name, image },
  id,
  className = "",
  onClick,
}: {
  user: TUser;
  id?: string;
  className?: string;
  onClick?: () => void;
}) {
  const names = (name ?? "").split(" ")!;
  const svgName =
    names.length > 1
      ? names?.map((n) => n.slice(0, 1).toUpperCase()).join("")
      : names[0].slice(0, 2).toUpperCase();

  const classes =
    className +
    " overflow-hidden shrink-0 object-cover " +
    "rounded-full border-2 border-foreground inline-block aspect-square";

  return image ? (
    <Image
      {...{ id, onClick }}
      unoptimized
      className={classes}
      height={96}
      width={96}
      src={image}
      alt={`avatar of ${name ?? "someone"}`}
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
