"use client";

import { useState } from "react";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { costToFixed } from ".";

import Slider from "@/app/_components/slider";
import ItemShareAvatar from "./avatar";

export default function ItemShareSetter({ itemId }: { itemId: number }) {
  const [verbose, setVerbose] = useState(false);
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const currReceipt = rs.group!.activeReceipt!;

  const item = currReceipt.items!.find((item) => item.id === itemId)!;
  const users = rs.users;
  const notPayer = users.find((user) => user.id !== currReceipt.paidBy);

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
        {users.map((user) => {
          const userShare =
            item.itemShares?.find((is) => is.userId === user.id)?.share ?? 0;

          return (
            <ItemShareAvatar
              key={user.id}
              user={user}
              focused={user.id === notPayer?.id}
              value={userShare}
              onChange={(ev) => {
                const ishIdx =
                  item.itemShares?.findIndex((sh) => sh.userId === user.id) ??
                  -1;
                const share = Number(ev.target.value);

                const itemShares =
                  ishIdx > -1
                    ? item.itemShares?.map((sh) =>
                        sh.userId === user.id ? { ...sh, share } : sh
                      )
                    : item.itemShares?.concat({ userId: user.id, share });

                dispatch(red.updateItem({ id: itemId, itemShares }));
              }}
              {...(verbose && {
                itemId,
              })}
            />
          );
        })}
      </div>
      {verbose && <p>where {costToFixed(item)} is the cost of the item</p>}
    </div>
  );
}
