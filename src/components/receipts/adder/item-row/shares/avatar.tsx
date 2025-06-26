"use client";

import { ChangeEventHandler, useEffect, useRef } from "react";

import { User } from "@/lib/models";

export default function ItemShareAvatar({
  user,
  value,
  focused,
  onChange,
}: {
  user: User;
  value: string | number;
  focused?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!!onChange && focused) ref.current?.focus();
  }, []);

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
            ref={ref}
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
