"use client";

import { KeyboardEventHandler, useEffect, useRef } from "react";

import {
  useAppDispatch,
  useGroupSelector,
  useBodyNodes,
} from "@/app/_lib/hooks";
import { rCombined as red } from "@/app/_lib/reducers";
import { TCliItem } from "@/app/_lib/reducers/types";

import Options from "./options";
import OptionsAsModal from "./options/modal";

export default function ItemRow({
  autoFocus,
  onKeyDown: adderKeyDownHandler,
  ...item
}: TCliItem & {
  autoFocus: boolean;
  onKeyDown: KeyboardEventHandler<HTMLInputElement>;
}) {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const rs = useGroupSelector();
  const isMultiUser = rs.users.length > 1;

  const catRef = useRef<HTMLSelectElement>(null);
  const costRef = useRef<HTMLInputElement>(null);

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
            red.updateItem({
              id: item.id!,
              categoryId: Number(ev.target.value),
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
        {rs.group?.categories?.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <button
        className="sm:hidden"
        onClick={() =>
          nodes.push(
            <OptionsAsModal key="options-as-modal" {...{ itemId: item.id! }} />
          )
        }
      >
        ⚙️
      </button>

      <div
        className={
          "hidden sm:grid grid-cols-subgrid gap-2 " +
          (isMultiUser ? "col-span-4" : "col-span-3")
        }
      >
        <Options {...{ itemId: item.id! }} />
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
          type="number"
          placeholder="cost"
          className={
            "w-15 no-spinner" +
            (isNaN(Number(item.cost)) ? " border-2! border-red-500" : "")
          }
          value={item.cost}
          onChange={(ev) =>
            dispatch(
              red.updateItem({
                id: item.id!,
                cost: ev.target.value.replace(",", "."),
              })
            )
          }
          onFocus={() => dispatch(red.setFocusedRow(-1))}
          onKeyDown={(ev) => {
            if (ev.shiftKey) {
              ev.preventDefault();
              catRef.current?.focus();
            } else adderKeyDownHandler(ev);
          }}
        />
      </form>
    </>
  );
}
