"use client";

import { KeyboardEventHandler, useEffect, useRef } from "react";

import { useAppDispatch, useAppSelector, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { useModal } from "..";

import Options from "./options";
import Modal from "./modal";

const RE_ANY_LETTER = /^\p{Letter}$/u;

export default function ItemRow({
  itemId,
  autoFocus,
  onKeyDown: adderKeyDownHandler,
}: {
  itemId: number;
  autoFocus: boolean;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
}) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const currReceipt = useAppSelector((s) =>
    rs.groupId ? s.combined.newReceipts[rs.groupId] : undefined
  );
  const isMultiUser = (rs.group()?.Users?.length ?? 0) > 1;

  const { setModal } = useModal();

  const catRef = useRef<HTMLSelectElement>(null);
  const costRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) costRef.current?.focus();
  }, [autoFocus]);

  if (!currReceipt) return null;

  const item = currReceipt.items.find((item) => item.id === itemId)!;
  // TODO: buggy, unable to edit numbers properly...
  // const costAsNum = Number(i.cost);
  // const cost = isNaN(costAsNum) ? i.cost : costAsNum.toFixed(2);
  const cost = item.cost;

  return (
    <>
      <select
        ref={catRef}
        className="rounded border p-1"
        value={item.catId}
        onChange={(ev) =>
          dispatch(
            red.updateItem({
              id: item.id,
              catId: Number(ev.target.value),
            })
          )
        }
        onKeyDown={(ev) => {
          if (ev.shiftKey) {
            ev.preventDefault();
            costRef.current?.focus();
          }
        }}
      >
        {rs.group()?.Categories?.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <button
        className="sm:hidden"
        onClick={() => setModal(<Modal {...{ itemId }} />)}
      >
        ⚙️
      </button>

      <div
        className={
          "hidden sm:grid grid-cols-subgrid gap-2 " +
          (isMultiUser ? "col-span-4" : "col-span-3")
        }
      >
        <Options {...{ itemId }} />
      </div>

      <form
        className="inline-flex items-center gap-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!isNaN(Number(item.cost))) dispatch(red.addRow(item.id));
        }}
      >
        €
        <input
          ref={costRef}
          type="text"
          placeholder="cost"
          className={
            "w-15 " +
            (isNaN(Number(item.cost)) ? " border-2! border-red-500" : "")
          }
          value={cost}
          onChange={(ev) =>
            dispatch(
              red.updateItem({
                id: item.id,
                cost: ev.target.value.replace(",", "."),
              })
            )
          }
          onFocus={() => {
            if (currReceipt.focusedIdx !== -1) dispatch(red.setFocusedRow(-1));
          }}
          onKeyDown={(ev) => {
            if (RE_ANY_LETTER.test(ev.key) || ev.shiftKey) {
              ev.preventDefault();
              catRef.current?.focus();
            } else adderKeyDownHandler(ev);
          }}
        />
      </form>
    </>
  );
}
