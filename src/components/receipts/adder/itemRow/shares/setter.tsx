"use client";

import { useState } from "react";

import { useAppDispatch, useAppSelector, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { costToFixed } from ".";

import Slider from "@/components/slider";
import ItemShareAvatar from "./avatar";

export default function ItemShareSetter({ itemId }: { itemId: number }) {
  const [verbose, setVerbose] = useState(false);
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const currReceipt = useAppSelector((s) =>
    rs.groupId ? s.combined.newReceipts[rs.groupId] : undefined
  )!;

  const item = currReceipt.items.find((item) => item.id === itemId)!;
  const users = rs.group()?.Users;
  const notPayer = users?.find((user) => user.id !== currReceipt.paidBy);

  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "flex flex-col gap-6 items-center justify-center"
      }
    >
      <div className="flex gap-2 items-center">
        <Slider checked={verbose} onClick={() => setVerbose(!verbose)} /> Show
        calculations
      </div>

      <div className="flex flex-wrap gap-6 items-center justify-evenly">
        {users?.map((user) => (
          <ItemShareAvatar
            key={user.id}
            user={user}
            focused={user.id === notPayer?.id}
            value={item.shares[user.id] ?? ""}
            onChange={(ev) => {
              dispatch(
                red.updateItem({
                  id: itemId,
                  shares: {
                    ...item.shares,
                    [user.id]: Number(ev.target.value),
                  },
                })
              );
            }}
            {...(verbose && {
              itemId,
            })}
          />
        ))}
      </div>
      {verbose && <p>where {costToFixed(item)} is the cost of the item</p>}
    </div>
  );
}
