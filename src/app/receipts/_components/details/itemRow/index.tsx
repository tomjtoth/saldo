"use client";

import { useEffect } from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { virt } from "@/app/_lib/utils";
import { thunks } from "@/app/_lib/reducers";
import { Item } from "@/app/receipts/_lib";

import ItemOptions, { ItemOptionsAsModal } from "./options";
import useItemRowLogic from "./logic";


export default function ItemRow({
  itemId,
  highlighted,
}: {
  itemId: Item["id"];
  highlighted: boolean;
}) {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const group = useClientState("group")!;

  const {
    refs: { categoryRef, costRef, ...refs },
    handlers,
    disabled,
    categoryId,
    cost,
    isMultiUser,
    updatingReceipt,
    autoFocus,
  } = useItemRowLogic(itemId);

  useEffect(() => {
    if (autoFocus) costRef.current?.focus();
  }, [autoFocus]);

  return (
    <>
      <select
        ref={categoryRef}
        className="rounded border p-1 min-w-20"
        value={categoryId}
        disabled={disabled}
        onChange={(ev) =>
          dispatch(
            thunks.modItem({
              id: itemId,
              categoryId: Number(ev.target.value),
            })
          )
        }
        onKeyDown={handlers.category}
      >
        {group.categories.map((cat) =>
          virt(cat).active || updatingReceipt ? (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ) : null
        )}
      </select>

      <button
        className="sm:hidden"
        onClick={() => nodes.push(ItemOptionsAsModal, { itemId })}
        disabled={disabled}
      >
        ⚙️
      </button>

      <div
        className={
          "hidden sm:grid grid-cols-subgrid gap-2 " +
          (isMultiUser ? "col-span-4" : "col-span-3")
        }
      >
        <ItemOptions {...{ itemId, handlers, refs }} />
      </div>

      <form
        className="inline-flex items-center gap-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!isNaN(Number(cost))) dispatch(thunks.addItem(itemId));
        }}
      >
        €
        <input
          ref={costRef}
          type="text"
          inputMode="decimal"
          disabled={disabled}
          placeholder="cost"
          className={
            "w-15 " +
            (isNaN(Number(cost)) ? " border-2! border-red-500" : "") +
            (highlighted ? " bg-amber-500" : "")
          }
          value={cost === "0.00" ? "" : cost}
          onChange={handlers.costChange}
          onFocus={() => dispatch(thunks.focusItem())}
          onKeyDown={handlers.cost}
        />
      </form>
    </>
  );
}
