"use client";

import { useAppDispatch, useAppSelector, useGroupSelector } from "@/lib/hooks";
import { rCombined as red, TCliItem } from "@/lib/reducers";

import Canceler from "../canceler";
import { KeyboardEventHandler, useEffect, useRef, useState } from "react";

const RE_ANY_LETTER = /^\p{Letter}$/u;

export default function ItemRow({
  item,
  autoFocus,
  switchRowHandler,
}: {
  item: TCliItem;
  autoFocus: boolean;
  switchRowHandler: KeyboardEventHandler<HTMLInputElement>;
}) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const currReceipt = useAppSelector((s) =>
    rs.groupId ? s.combined.newReceipts[rs.groupId] : undefined
  );

  const catRef = useRef<HTMLSelectElement>(null);
  const costRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) costRef.current?.focus();
  }, [autoFocus]);

  const [optsVisible, setOptsVisible] = useState(false);
  const hideOpts = () => setOptsVisible(false);

  if (!currReceipt) return null;

  // TODO: buggy, unable to edit numbers properly...
  // const costAsNum = Number(i.cost);
  // const cost = isNaN(costAsNum) ? i.cost : costAsNum.toFixed(2);
  const cost = item.cost;

  const options = (
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

      {currReceipt.items.length > 1 && (
        <button
          className="inline-flex items-center gap-2 bg-background"
          onClick={() => dispatch(red.rmRow(item.id))}
        >
          <span className="sm:hidden lg:inline-block">
            {"Remove this row ".replaceAll(" ", "\u00A0")}
          </span>
          ➖
        </button>
      )}

      <button
        className="inline-flex items-center gap-2 col-start-4 bg-background"
        onClick={() => dispatch(red.addRow(item.id))}
      >
        <span className="sm:hidden lg:inline-block">
          {"Add row below ".replaceAll(" ", "\u00A0")}
        </span>{" "}
        ➕
      </button>
    </>
  );

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

      <button className="sm:hidden" onClick={() => setOptsVisible(true)}>
        ⚙️
      </button>

      {optsVisible && (
        <Canceler className="sm:hidden" zIndex={1} onClick={hideOpts}>
          <div
            className={
              "absolute left-1/2 top-1/2 -translate-1/2 " +
              "p-2 flex flex-wrap gap-2 justify-evenly"
            }
            onClick={(ev) => {
              if (ev.target === ev.currentTarget) hideOpts();
            }}
          >
            {options}
          </div>
        </Canceler>
      )}

      <div className="hidden sm:grid col-span-3 grid-cols-subgrid gap-2">
        {options}
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
          className="w-15 grow sm:grow-0"
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
            } else switchRowHandler(ev);
          }}
        />
      </form>
    </>
  );
}
