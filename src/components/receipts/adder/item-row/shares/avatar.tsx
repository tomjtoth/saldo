"use client";

import { ChangeEventHandler } from "react";

import { User } from "@/lib/models";

export default function ItemShareAvatar({
  user,
  value,
  onChange,
}: {
  user: User;
  value: string | number;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div className="flex flex-col gap-2 items-center">
      <div className={"relative " + (onChange ? "w-25 h-25" : "w-8 h-8")}>
        <img
          src={user.image}
          alt={`avatar of ${user.name}`}
          className="object-cover border-2 rounded-full"
        />
        {onChange ? (
          <input
            type="text"
            value={value}
            onChange={onChange}
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full! text-center bg-background border"
          />
        ) : (
          <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full text-center text-xs bg-background border">
            {value}
          </div>
        )}
      </div>
      {onChange && <div className="text-center">{user.name}</div>}
    </div>
  );
}
