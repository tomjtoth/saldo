"use client";

import { KeyboardEventHandler, useEffect, useRef, useState } from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { virt } from "@/app/_lib/utils";
import { thunks } from "@/app/_lib/reducers";
import { Item } from "@/app/receipts/_lib";

import ItemOptions, { ItemOptionsAsModal } from "./options";
import ItemOptionsAsModal from "./options/modal";

const RE_ONE_LETTER = /^\p{Letter}$/u;
const RE_COMMA = /^(.*)(\d)$/;

export default function ItemRow({
  itemId,
  highlighted,
  onKeyDown: adderKeyDownHandler,
}: {
  itemId: Item["id"];
  highlighted: boolean;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
}) {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const group = useClientState("group")!;
  const users = useClientState("users");

  const receipt = group.activeReceipt!;
  const item = receipt.items.find((i) => i.id === itemId)!;
  const isMultiUser = users.length > 1;
  const autoFocus = itemId === receipt.focusedItemId;

  const [cost, setCost] = useState(item.cost === 0 ? "" : item.cost.toFixed(2));

  const refs = {
    category: useRef<HTMLSelectElement>(null);
  const costRef = useRef<HTMLInputElement>(null);
  const [cost, setCost] = useState(item.cost.toFixed(2));
  const commaHelper = useRef(false);

  useEffect(() => {
    if (autoFocus) costRef.current?.focus();
  }, [autoFocus]);

  const updatingReceipt = group?.activeReceipt?.id !== -1;

  return (
    <>
      <select
        ref={catRef}
        className="rounded border p-1 min-w-20"
        value={item.categoryId}
        onChange={(ev) =>
          dispatch(
            thunks.modItem({
              id: item.id,
              categoryId: Number(ev.target.value),
            })
          )
        }
        onKeyDown={(ev) => {
          if (ev.key === "c") {
            ev.preventDefault();
            costRef.current?.focus();
          }
        }}
      >
        {group?.categories.map((cat) =>
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
      >
        ⚙️
      </button>

      <div
        className={
          "hidden sm:grid grid-cols-subgrid gap-2 " +
          (isMultiUser ? "col-span-4" : "col-span-3")
        }
      >
        <ItemOptions {...{ itemId: item.id }} />
      </div>

      <form
        className="inline-flex items-center gap-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!isNaN(Number(cost))) dispatch(thunks.addRow(item.id));
        }}
      >
        €
        <input
          ref={costRef}
          type="number"
          step={0.01}
          placeholder="cost"
          className={
            "w-15 no-spinner" +
            (isNaN(Number(cost)) ? " border-2! border-red-500" : "") +
            (highlighted ? " bg-amber-500" : "")
          }
          value={cost === "0.00" ? "" : cost}
          onChange={(ev) => {
            let asStr = ev.target.value;

            if (commaHelper.current) {
              asStr = asStr.replace(RE_COMMA, "$1.$2");
              commaHelper.current = false;
            }

            setCost(asStr);

            const asNum = Number(asStr);
            if (!isNaN(asNum))
              dispatch(thunks.modItem({ id: item.id, cost: asNum }));
          }}
          onFocus={() => dispatch(thunks.setFocusedRow(-1))}
          onKeyDown={(ev) => {
            if (ev.key === "," && !cost.includes(".")) {
              commaHelper.current = true;
              ev.preventDefault();
            } else if (ev.key === "-" && cost.length > 0) {
              ev.preventDefault();
            } else if (ev.key === "c") {
              ev.preventDefault();
              catRef.current?.focus();
            } else if (
              !(ev.ctrlKey && ev.key === "s") &&
              ev.key.match(RE_ONE_LETTER)
            ) {
              // this is necessary in Firefox as it validates number inputs only upon submission...

              ev.preventDefault();
            } else adderKeyDownHandler(ev);
          }}
        />
      </form>
    </>
  );
}
