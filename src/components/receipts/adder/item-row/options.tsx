"use client";

import { useAppDispatch, useAppSelector, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";

export default function Options({
  itemId,
  hideModal,
}: {
  itemId: number;
  hideModal?: () => void;
}) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const currReceipt = useAppSelector((s) =>
    rs.groupId ? s.combined.newReceipts[rs.groupId] : undefined
  )!;

  const item = currReceipt.items.find((item) => item.id === itemId)!;

  const users = rs.group()?.Users;
  const shares = Object.entries(item.shares);

  return (
    <>
      <textarea
        rows={1}
        placeholder="Optional comments..."
        className="resize-none grow bg-background"
        value={item.notes}
        onChange={(ev) =>
          dispatch(
            red.updateItem({
              id: item.id,
              notes: ev.target.value,
            })
          )
        }
      />

      <button className="bg-background inline-flex items-center gap-2">
        {shares.length > 0 ? (
          shares.map(([userId, share]) =>
            share === 0 ? null : (
              <div key={`${item.id}-${userId}`}>
                {users?.find((user) => user.id == Number(userId))?.name}
                <sub>{share}</sub>
              </div>
            )
          )
        ) : (
          <>
            <span className="sm:hidden xl:block">
              {"Edit shares".replaceAll(" ", "\u00A0")}
            </span>
            👪
          </>
        )}
      </button>

      {currReceipt.items.length > 1 && (
        <button
          className="inline-flex items-center gap-2 bg-background"
          onClick={() => {
            dispatch(red.rmRow(item.id));
            if (hideModal) hideModal();
          }}
        >
          <span className="sm:hidden xl:block">
            {"Remove this row".replaceAll(" ", "\u00A0")}
          </span>
          ➖
        </button>
      )}

      <button
        className="inline-flex items-center gap-2 col-start-5 bg-background"
        onClick={() => {
          dispatch(red.addRow(item.id));
          if (hideModal) hideModal();
        }}
      >
        <span className="sm:hidden xl:block">
          {"Add row below".replaceAll(" ", "\u00A0")}
        </span>{" "}
        ➕
      </button>
    </>
  );
}
