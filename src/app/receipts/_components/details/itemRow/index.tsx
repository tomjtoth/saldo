"use client";

import { KeyboardEventHandler, useEffect, useRef, useState } from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { Item } from "@/app/receipts/_lib";

import Options from "./options";
import OptionsAsModal from "./options/modal";

export default function ItemRow({
  itemId,
  autoFocus,
  onKeyDown: adderKeyDownHandler,
}: {
  itemId: Item["id"];
  autoFocus: boolean;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
}) {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const group = useClientState("group");
  const item = group?.activeReceipt!.items.find((i) => i.id === itemId)!;

  const isMultiUser = group?.users.length;

  const catRef = useRef<HTMLSelectElement>(null);
  const costRef = useRef<HTMLInputElement>(null);
  const [cost, setCost] = useState(item.cost.toFixed(2));

  useEffect(() => {
    if (autoFocus) costRef.current?.focus();
  }, [autoFocus]);

  // TODO: buggy, unable to edit numbers properly...
  // const costAsNum = Number(i.cost);
  // const cost = isNaN(costAsNum) ? i.cost : costAsNum.toFixed(2);

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
        {group?.categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <button
        className="sm:hidden"
        onClick={() => nodes.push(OptionsAsModal, { itemId: item.id })}
      >
        ⚙️
      </button>

      <div
        className={
          "hidden sm:grid grid-cols-subgrid gap-2 " +
          (isMultiUser ? "col-span-4" : "col-span-3")
        }
      >
        <Options {...{ itemId: item.id }} />
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
          placeholder="cost"
          className={
            "w-15 no-spinner" +
            (isNaN(Number(cost)) ? " border-2! border-red-500" : "")
          }
          value={cost === "0.00" ? "" : cost}
          onChange={(ev) => {
            const asStr = ev.target.value.replace(",", ".");
            setCost(asStr);

            const asNum = Number(asStr);
            if (!isNaN(asNum))
              dispatch(thunks.modItem({ id: item.id, cost: asNum }));
          }}
          onFocus={() => dispatch(thunks.setFocusedRow(-1))}
          onKeyDown={(ev) => {
            if (ev.key === "c") {
              ev.preventDefault();
              catRef.current?.focus();
            } else adderKeyDownHandler(ev);
          }}
        />
      </form>
    </>
  );
}
