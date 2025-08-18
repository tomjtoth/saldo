"use client";

import { ChangeEventHandler, useEffect, useRef } from "react";

import { TUser } from "@/lib/db";
import { useAppSelector, useGroupSelector } from "@/lib/hooks";
import { TCliItem } from "@/lib/reducers";
import { costToFixed } from ".";

export default function ItemShareAvatar({
  user,
  value,
  itemId,
  focused,
  onChange,
}: {
  user: TUser;
  value: string | number;
  itemId?: number;
  focused?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const rs = useGroupSelector();
  const currReceipt = useAppSelector((s) =>
    rs.groupId ? s.combined.newReceipts[rs.groupId] : undefined
  );

  useEffect(() => {
    if (!!onChange && focused) ref.current?.focus();
  }, []);

  let item: TCliItem | null = null;
  let denominator = 0;
  let share = 0;
  let calculations = null;

  if (itemId !== undefined) {
    item = currReceipt!.items.find((item) => item.id === itemId)!;
    denominator = Object.values(item.shares).reduce(
      (sub, share) => sub + share,
      0
    );

    const costAsNum = Number(item.cost);
    share =
      ((isNaN(costAsNum) ? 0 : costAsNum) * item.shares[user.id!]) /
      denominator;

    calculations = (
      <span>
        💸{" "}
        {denominator > 0 ? (
          <span>
            {costToFixed(item, costAsNum)} * {item?.shares[user.id!] ?? 0} /{" "}
            {denominator} = {share.toFixed(2)}
          </span>
        ) : user.id === currReceipt?.paidBy ? (
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
        <img
          src={user.image ?? "TODO: merge this with the svg genration stuff"}
          alt={`avatar of ${user.name}`}
          className="object-cover border-2 rounded-full"
        />
        {onChange ? (
          <input
            ref={ref}
            type="number"
            placeholder="N+1"
            min={0}
            value={value === 0 ? "" : value}
            onChange={onChange}
            className="no-spinner absolute -bottom-2 -right-2 w-10 h-10 rounded-full! text-center bg-background border"
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
