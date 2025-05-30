import { auth } from "@/auth";
import AvatarClientSide from "./client-side";

export default async function UserAvatar() {
  const sess = await auth();

  const names = (sess?.user?.name ?? "").split(" ")!;
  const initials =
    names.length > 1
      ? names?.map((n) => n.slice(0, 1).toUpperCase()).join("")
      : names[0].slice(0, 2).toUpperCase();

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
        fontFamily="sans-serif"
        fontWeight="bold"
        className="select-none"
      >
        {initials}
      </text>
    </svg>
  );

  return (
    <AvatarClientSide
      authenticated={!!sess}
      avatar={avatar}
      name={sess?.user?.name ?? ""}
      email={sess?.user?.email ?? ""}
    />
  );
}
