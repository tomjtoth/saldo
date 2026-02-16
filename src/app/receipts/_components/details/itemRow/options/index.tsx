"use client";

import { KeyboardEventHandler, RefObject } from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { Item } from "@/app/receipts/_lib";

import Canceler from "@/app/_components/canceler";
import ItemShareSetter from "./shares/setter";
import ItemShareOverview from "./shares";

export default function ItemOptions({
  itemId,
  refs: { notesRef, sharesRef, rmRowRef, addRowRef } = {},
  handlers,
}: {
  itemId: Item["id"];
  refs?: {
    notesRef?: RefObject<HTMLTextAreaElement | null>;
    sharesRef?: RefObject<HTMLDivElement | null>;
    rmRowRef?: RefObject<HTMLButtonElement | null>;
    addRowRef?: RefObject<HTMLButtonElement | null>;
  };
  handlers?: {
    notes: KeyboardEventHandler<HTMLTextAreaElement>;
    shares: KeyboardEventHandler<HTMLDivElement>;
    rmRow: KeyboardEventHandler<HTMLButtonElement>;
    addRow: KeyboardEventHandler<HTMLButtonElement>;
  };
}) {
  const nodes = useBodyNodes();
  const dispatch = useAppDispatch();
  const users = useClientState("users");
  const group = useClientState("group");
  const receipt = group!.activeReceipt!;

  const showSetter = () => nodes.push(ItemShareSetter, { itemId });

  const item = receipt.items.find((i) => i.id === itemId)!;

  const isMultiUser = users.length > 1;
  const shares = item.itemShares;

  return (
    <>
      <textarea
        ref={notesRef}
        onKeyDown={handlers?.notes}
        rows={1}
        placeholder="Optional comments..."
        className="resize-none grow bg-background min-w-20"
        value={item.notes ?? ""}
        onChange={(ev) =>
          dispatch(
            thunks.modItem({
              id: itemId,
              notes: ev.target.value,
            }),
          )
        }
      />

      {isMultiUser && (
        <ItemShareOverview
          {...{
            shares,
            showSetter,
            ref: sharesRef,
            onKeyDown: handlers?.shares,
          }}
        />
      )}

      {receipt.items.length > 1 && (
        <button
          ref={rmRowRef}
          onKeyDown={handlers?.rmRow}
          className="inline-flex items-center gap-2 bg-background"
          onClick={() => {
            dispatch(thunks.rmItem(itemId));
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
        ref={addRowRef}
        onKeyDown={handlers?.addRow}
        className="inline-flex items-center gap-2 col-start-5 bg-background"
        onClick={() => {
          dispatch(thunks.addItem(itemId));
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
    <Canceler
      className="sm:hidden z-2"
      classNamesFor={{ children: { bg: false, border: false, rounded: false } }}
    >
      <div
        className="flex flex-wrap gap-2 justify-evenly"
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) nodes.pop();
        }}
      >
        <ItemOptions {...{ itemId }} />
      </div>
    </Canceler>
  );
}
