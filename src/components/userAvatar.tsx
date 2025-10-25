import { TUser } from "@/lib/db";

export default function UserAvatar({ name, image }: TUser) {
  const names = (name ?? "").split(" ")!;
  const svgName =
    names.length > 1
      ? names?.map((n) => n.slice(0, 1).toUpperCase()).join("")
      : names[0].slice(0, 2).toUpperCase();

  const classes =
    "overflow-hidden shrink-0 object-cover " +
    "rounded-full border-2 inline-block aspect-square";

  return image ? (
    <img
      className={classes + " h-full"}
      height={96}
      width={96}
      src={image}
      alt="User Avatar"
      draggable={false}
    />
  ) : (
    <svg xmlns="" className={classes}>
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
