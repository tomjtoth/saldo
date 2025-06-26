"use client";

import { useAppDispatch, useAppSelector, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import ItemShareAvatar from "./avatar";

export default function ItemShareSetter({ itemId }: { itemId: number }) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const currReceipt = useAppSelector((s) =>
    rs.groupId ? s.combined.newReceipts[rs.groupId] : undefined
  )!;

  const item = currReceipt.items.find((item) => item.id === itemId)!;
  const users = rs.group()?.Users;

  return (
    <div className="absolute left-1/2 top-1/2 -translate-1/2 flex flex-wrap gap-6 justify-evenly">
      {users?.map((user) => (
        <ItemShareAvatar
          key={user.id}
          user={user}
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
        />
      ))}
    </div>
  );
}
