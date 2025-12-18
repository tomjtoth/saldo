"use client";

import { useState } from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { Item } from "@/app/receipts/_lib";

import Slider from "@/app/_components/slider";
import Canceler from "@/app/_components/canceler";
import ItemShareAvatar from "./avatar";

export default function ItemShareSetter({ itemId }: { itemId: Item["id"] }) {
  const nodes = useBodyNodes();
  const [verbose, setVerbose] = useState(false);
  const dispatch = useAppDispatch();
  const group = useClientState("group")!;
  const users = useClientState("users");
  const receipt = group.activeReceipt!;

  const item = receipt.items.find((item) => item.id === itemId)!;
  const notPayer = users.find((user) => user.id !== receipt.paidById);

  return (
    <Canceler
      className={
        "z-2" +
        (nodes.length > 1 ? " backdrop-opacity-100 bg-background/50" : "")
      }
      onClick={() => nodes.setNodes(([receipt]) => [receipt])}
    >
      <div className="flex flex-col gap-6 items-center justify-center">
        <div className="flex gap-2 items-center">
          <Slider checked={verbose} onClick={() => setVerbose(!verbose)}>
            Show calculations
          </Slider>
        </div>

        <div className="flex flex-wrap gap-6 items-center justify-evenly overflow-y-scroll">
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
    </Canceler>
  );
}
