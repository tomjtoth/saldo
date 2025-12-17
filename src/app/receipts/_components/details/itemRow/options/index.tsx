"use client";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { Item } from "@/app/receipts/_lib";

import Canceler from "@/app/_components/canceler";
import ItemShareSetter from "../shares/setter";
import ItemShareAvatar from "../shares/avatar";

export default function ItemOptions({ itemId }: { itemId: Item["id"] }) {
  const nodes = useBodyNodes();
  const dispatch = useAppDispatch();
  const users = useClientState("users");
  const group = useClientState("group");
  const receipt = group!.activeReceipt!;

  const showSetter = () => nodes.push(ItemShareSetter, { itemId });

  const item = receipt.items.find((i) => i.id === itemId);

  if (!item) return null;

  const isMultiUser = users.length > 1;
  const shares = item.itemShares;

  return (
    <>
      <textarea
        rows={1}
        placeholder="Optional comments..."
        className="resize-none grow bg-background"
        value={item.notes ?? ""}
        onChange={(ev) =>
          dispatch(
            thunks.modItem({
              id: item.id,
              notes: ev.target.value,
            })
          )
        }
      />

      {isMultiUser &&
        (shares.reduce((sum, { share }) => sum + share, 0) > 0 ? (
          <div
            className="flex gap-2 cursor-pointer mr-2 mb-2 sm:mb-0 items-center justify-evenly"
            onClick={showSetter}
          >
            {shares.map(({ userId, share }) =>
              share === 0 ? null : (
                <ItemShareAvatar key={userId} userId={userId} value={share} />
              )
            )}
          </div>
        ) : (
          <button
            className="bg-background inline-flex items-center gap-2 text-center"
            onClick={showSetter}
          >
            <>
              <span className="sm:hidden xl:block whitespace-nowrap">
                Edit shares
              </span>
              👪
            </>
          </button>
        ))}

      {receipt.items.length > 1 && (
        <button
          className="inline-flex items-center gap-2 bg-background"
          onClick={() => {
            dispatch(thunks.rmRow(item.id));
            if (nodes.length > 1) nodes.pop();
          }}
        >
          <span className="sm:hidden xl:block whitespace-nowrap">
            Remove this row
          </span>
          ➖
        </button>
      )}

      <button
        className="inline-flex items-center gap-2 col-start-5 bg-background"
        onClick={() => {
          dispatch(thunks.addRow(item.id));
          if (nodes.length > 1) nodes.pop();
        }}
      >
        <span className="sm:hidden xl:block whitespace-nowrap">
          Add row below
        </span>{" "}
        ➕
      </button>
    </>
  );
}

export function ItemOptionsAsModal({ itemId }: { itemId: Item["id"] }) {
  const nodes = useBodyNodes();

  return (
    <Canceler className="sm:hidden z-2" onClick={nodes.pop}>
      <div
        className={
          "absolute left-1/2 top-1/2 -translate-1/2 " +
          "p-2 flex flex-wrap gap-2 justify-evenly"
        }
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) nodes.pop();
        }}
      >
        <ItemOptions {...{ itemId }} />
      </div>
    </Canceler>
  );
}
