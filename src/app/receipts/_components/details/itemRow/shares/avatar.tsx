"use client";

import { ChangeEventHandler, useEffect, useRef } from "react";

import { User } from "@/app/(users)/_lib";
import { useClientState } from "@/app/_lib/hooks";
import { Item } from "@/app/receipts/_lib";
import { costToFixed } from ".";

import UserAvatar from "@/app/_components/userAvatar";

export default function ItemShareAvatar({
  user,
  value,
  itemId,
  focused,
  onChange,
}: {
  user: Pick<User, "id" | "name" | "image">;
  value: string | number;
  itemId?: Item["id"];
  focused?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const cs = useClientState();
  const currReceipt = cs.group!.activeReceipt!;

  useEffect(() => {
    if (!!onChange && focused) ref.current?.focus();
  }, []);

  let item: Item | null = null;
  let denominator = 0;
  let share = 0;
  let calculations = null;

  if (itemId !== undefined) {
    item = currReceipt.items.find((item) => item.id === itemId)!;
    denominator = item.itemShares.reduce(
      (sub, { share }) => sub + (share ?? 0),
      0
    );

    const costAsNum = Number(item.cost);
    const shareOfUser =
      item.itemShares.find((sh) => sh.userId === user.id)?.share ?? 0;

    share = ((isNaN(costAsNum) ? 0 : costAsNum) * shareOfUser) / denominator;

    calculations = (
      <span>
        💸{" "}
        {denominator > 0 ? (
          <span>
            {costToFixed(item, costAsNum)} * {shareOfUser} / {denominator} ={" "}
            {share.toFixed(2)}
          </span>
        ) : user.id === currReceipt.paidBy.id ? (
          <span>{costToFixed(item, costAsNum)}</span>
        ) : (
          <span>{(0).toFixed(2)}</span>
        )}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2 items-center">
      <div className={"relative " + (onChange ? "w-25 h-25" : "w-8 h-8")}>
        <UserAvatar user={user} />

        {onChange ? (
          <input
            ref={ref}
            type="number"
            placeholder="N+1"
            min={0}
            value={value === 0 ? "" : value}
            onChange={onChange}
            className={
              "no-spinner absolute -bottom-2 -right-6 w-14 h-10 rounded-full! " +
              "text-center bg-background "
            }
          />
        ) : (
          <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full text-center text-xs bg-background border">
            {value}
          </div>
        )}
      </div>

      {onChange && (
        <>
          <div className="text-center">{user.name}</div>
          {calculations}
        </>
      )}
    </div>
  );
}
