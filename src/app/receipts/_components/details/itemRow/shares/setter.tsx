"use client";

import { useState } from "react";

import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { Item } from "@/app/receipts/_lib";

import Slider from "@/app/_components/slider";
import ItemShareAvatar from "./avatar";

export default function ItemShareSetter({ itemId }: { itemId: Item["id"] }) {
  const [verbose, setVerbose] = useState(false);
  const dispatch = useAppDispatch();
  const group = useClientState("group")!;
  const receipt = group.activeReceipt!;

  const item = receipt.items.find((item) => item.id === itemId)!;
  const users = group.users;
  const notPayer = users.find((user) => user.id !== receipt.paidById);

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
            item.itemShares.find((is) => is.userId === user.id)?.share ?? 0;

          return (
            <ItemShareAvatar
              key={user.id}
              userId={user.id}
              itemId={verbose ? itemId : undefined}
              focused={user.id === notPayer?.id}
              value={userShare}
              onChange={(ev) => {
                const ishIdx =
                  item.itemShares.findIndex((sh) => sh.userId === user.id) ??
                  -1;
                const share = Number(ev.target.value);

                const itemShares =
                  ishIdx > -1
                    ? item.itemShares.map((sh) =>
                        sh.userId === user.id ? { ...sh, share } : sh
                      )
                    : item.itemShares.concat([
                        {
                          userId: user.id,
                          share,
                          archives: [],
                          flags: 1,
                          itemId: -1,
                          revisionId: -1,
                        },
                      ]);

                dispatch(thunks.modItem({ id: itemId, itemShares }));
              }}
            />
          );
        })}
      </div>
      {verbose && <p>where {item.cost.toFixed(2)} is the cost of the item</p>}
    </div>
  );
}
