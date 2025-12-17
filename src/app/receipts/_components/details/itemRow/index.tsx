"use client";

import { useEffect, useRef } from "react";

import {
  useAppDispatch,
  useBodyNodes,
  useClientState,
  useDebugger,
} from "@/app/_lib/hooks";
import { virt } from "@/app/_lib/utils";
import { thunks } from "@/app/_lib/reducers";
import { Item } from "@/app/receipts/_lib";

import ItemOptions, { ItemOptionsAsModal } from "./options";
import useItemRowLogic from "./hooks/logic";


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

  const categoryRef = useRef<HTMLSelectElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const sharesRef = useRef<HTMLDivElement>(null);
  const rmRowRef = useRef<HTMLButtonElement>(null);
  const addRowRef = useRef<HTMLButtonElement>(null);
  const costRef = useRef<HTMLInputElement>(null);

  const hk = useItemRowLogic(
    itemId,
    categoryRef,
    notesRef,
    sharesRef,
    rmRowRef,
    addRowRef,
    costRef
  );

  useEffect(() => {
    if (hk.autoFocus) costRef.current?.focus();
  }, [hk.autoFocus]);

  useDebugger({ hk });

  return (
    <>
      <select
        ref={categoryRef}
        className="rounded border p-1 min-w-20"
        value={hk.categoryId}
        onChange={(ev) =>
          dispatch(
            thunks.modItem({
              id: itemId,
              categoryId: Number(ev.target.value),
            })
          )
        }
        onKeyDown={hk.handlers.category}
      >
        {group.categories.map((cat) =>
          virt(cat).active || hk.updatingReceipt ? (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ) : null
        )}
      </select>

      <button
        className="sm:hidden"
        onClick={() => nodes.push(ItemOptionsAsModal, { itemId })}
      >
        ⚙️
      </button>

      <div
        className={
          "hidden sm:grid grid-cols-subgrid gap-2 " +
          (hk.isMultiUser ? "col-span-4" : "col-span-3")
        }
      >
        <ItemOptions
          {...{
            itemId,
            handlers: hk.handlers,
            notesRef,
            rmRowRef,
            addRowRef,
            sharesRef,
          }}
        />
      </div>

      <form
        className="inline-flex items-center gap-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!isNaN(Number(hk.cost))) dispatch(thunks.addRow(itemId));
        }}
      >
        €
        <input
          ref={costRef}
          type="text"
          inputMode="decimal"
          step={0.01}
          placeholder="cost"
          className={
            "w-15 no-spinner" +
            (isNaN(Number(hk.cost)) ? " border-2! border-red-500" : "") +
            (highlighted ? " bg-amber-500" : "")
          }
          value={hk.cost === "0.00" ? "" : hk.cost}
          onChange={hk.handlers.costChange}
          onFocus={() => dispatch(thunks.focusRow())}
          onKeyDown={hk.handlers.cost}
        />
      </form>
    </>
  );
}
