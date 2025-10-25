import { TUser } from "@/lib/db";

export default function UserAvatar({ name, image }: TUser) {
  const names = (name ?? "").split(" ")!;

  return (
    <div
      className={
        "w-10 h-10 overflow-hidden cursor-pointer shrink-0 " +
        "*:w-full *:h-full rounded-full border-2 inline-block"
      }
    >
      {image ? (
        <img
          className="object-cover"
          height={96}
          width={96}
          src={image}
          alt="User Avatar"
          draggable={false}
        />
      ) : (
        <svg xmlns="">
          <rect width={96} height={96} fill="red"></rect>
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
      )}
    </div>
  );
}
