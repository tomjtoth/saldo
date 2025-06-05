"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { showUserMenu } from "@/lib/reducers/overlay";

export default function UserAvatar() {
  const dispatch = useAppDispatch();
  const name = useAppSelector((s) => s.overlay.sess.name);
  const image = useAppSelector((s) => s.overlay.sess.image);

  const names = (name ?? "").split(" ")!;

  return (
    <div
      className="w-10 h-10 overflow-hidden border-2 inline-block rounded-[50%] *:w-full *:h-full [&_img]:object-cover cursor-pointer"
      onClick={() => dispatch(showUserMenu())}
    >
      {image ? (
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
      )}
    </div>
  );
}
