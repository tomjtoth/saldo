"use client";

import {
  KeyboardEventHandler,
  RefObject,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { Item } from "@/app/receipts/_lib";

import ItemShareSetter from "../options/shares/setter";

const DIFFS = {
  ArrowUp: -1,
  ArrowDown: 1,
  PageUp: -5,
  PageDown: 5,
};

const RE_OTHER_THAN_NUM_CHARS = /^[^\d,.-]$/;

export default function useItemRowLogic(
  itemId: Item["id"],
  categoryRef: RefObject<HTMLSelectElement | null>,
  notesRef: RefObject<HTMLTextAreaElement | null>,
  sharesRef: RefObject<HTMLDivElement | null>,
  rmRowRef: RefObject<HTMLButtonElement | null>,
  addRowRef: RefObject<HTMLButtonElement | null>,
  costRef: RefObject<HTMLInputElement | null>
) {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const group = useClientState("group")!;
  const users = useClientState("users");

  const receipt = group.activeReceipt!;
  const updatingReceipt = receipt.id !== -1;
  const itemIdx = receipt.items.findIndex((i) => i.id === itemId);
  const item = receipt.items[itemIdx];
  const isMultiUser = users.length > 1;
  const autoFocus = itemId === receipt.focusedItemId;

  const [caretPos, setCaretPos] = useState(-1);
  const [cost, setCost] = useState(item.cost === 0 ? "" : item.cost.toFixed(2));

  useLayoutEffect(() => {
    if (caretPos !== -1) {
      costRef.current?.setSelectionRange(caretPos, caretPos, "none");
      setCaretPos(-1);
    }
  }, [caretPos]);

  const handlers: {
    common: KeyboardEventHandler;
    category: KeyboardEventHandler<HTMLSelectElement>;
    notes: KeyboardEventHandler<HTMLTextAreaElement>;
    shares: KeyboardEventHandler<HTMLDivElement>;
    rmRow: KeyboardEventHandler<HTMLButtonElement>;
    addRow: KeyboardEventHandler<HTMLButtonElement>;
    cost: KeyboardEventHandler<HTMLInputElement>;
    costChange: (ev: { target: { value: string } }) => void;
  } = {
    common(ev) {
      const alt = ev.altKey && !ev.ctrlKey;

      if (ev.key in DIFFS) {
        ev.preventDefault();
        const lastIdx = receipt.items.length - 1;
        const newIdx = itemIdx + DIFFS[ev.key as keyof typeof DIFFS];

        dispatch(
          thunks.focusItem(
            receipt.items[newIdx < 0 ? 0 : newIdx > lastIdx ? lastIdx : newIdx]
              .id
          )
        );
      } else if (alt && ev.key === "c") {
        ev.preventDefault();

        costRef.current?.focus();
      } else if (alt && ev.key === "n") {
        ev.preventDefault();

        notesRef.current?.focus();
      } else if (alt && ev.key === "s") {
        ev.preventDefault();

        nodes.push(ItemShareSetter, { itemId });
      } else if (alt && ev.key === "a") {
        ev.preventDefault();

        dispatch(thunks.addItem(itemId));
      } else if (alt && ev.key === "r") {
        ev.preventDefault();

        if (receipt.items.length > 1) dispatch(thunks.rmItem(itemId));
      }
    },

    category(ev) {
      const navi = {
        ArrowLeft: costRef.current,
        ArrowRight: notesRef.current,
      };

      if (ev.key in navi) {
        ev.preventDefault();
        navi[ev.key as keyof typeof navi]?.focus();
      } else if (!["ArrowUp", "ArrowDown"].includes(ev.key)) {
        handlers.common(ev);
      }
    },

    notes(ev) {
      const t = ev.currentTarget;
      const notSelecting = t.selectionStart === t.selectionEnd;

      if (notSelecting && t.selectionStart === 0 && ev.key === "ArrowLeft") {
        categoryRef.current?.focus();
      }

      if (
        notSelecting &&
        t.selectionStart === t.value.length &&
        ev.key === "ArrowRight"
      ) {
        sharesRef.current?.focus();
      } else handlers.common(ev);
    },

    shares(ev) {
      const navi = {
        ArrowLeft: notesRef.current,
        ArrowRight: (receipt.items.length > 1 ? rmRowRef : addRowRef).current,
      };

      if (ev.key in navi) navi[ev.key as keyof typeof navi]?.focus();
      else handlers.common(ev);
    },

    rmRow(ev) {
      const navi = {
        ArrowLeft: sharesRef.current,
        ArrowRight: addRowRef.current,
      };

      if (ev.key in navi) navi[ev.key as keyof typeof navi]?.focus();
      else handlers.common(ev);
    },

    addRow(ev) {
      const navi = {
        ArrowLeft: (receipt.items.length > 1 ? rmRowRef : sharesRef).current,
        ArrowRight: costRef.current,
      };

      if (ev.key in navi) navi[ev.key as keyof typeof navi]?.focus();
      else handlers.common(ev);
    },

    cost(ev) {
      const alt = ev.altKey && !ev.ctrlKey;

      const t = ev.currentTarget;
      const notSelecting = t.selectionStart === t.selectionEnd;

      if (ev.key === "ArrowLeft" && notSelecting && t.selectionStart === 0) {
        addRowRef.current?.focus();
      } else if (
        ev.key === "ArrowRight" &&
        notSelecting &&
        t.selectionStart === t.value.length
      ) {
        categoryRef.current?.focus();
      } else if (alt && ev.key === "c") {
        ev.preventDefault();
        categoryRef.current?.focus();
      } else if (ev.key === "-") {
        // cancel original
        ev.preventDefault();

        const t = ev.currentTarget;

        const alreadyMinus = cost.startsWith("-");
        setCaretPos(t.selectionStart! + (alreadyMinus ? -1 : 1));

        // call with customized value
        handlers.costChange({
          target: {
            value: alreadyMinus
              ? cost.slice(1)
              : "-" + (cost === "0.00" ? "" : cost),
          },
        });
      } else if (
        (",.".indexOf(ev.key) > -1 && cost.includes(".")) ||
        (!(ev.ctrlKey && "ascvyz".indexOf(ev.key) > -1) &&
          !(alt && "asnr".indexOf(ev.key) > -1) &&
          ev.key.match(RE_OTHER_THAN_NUM_CHARS))
      ) {
        ev.preventDefault();
      } else handlers.common(ev);
    },

    costChange(ev) {
      const asStr = ev.target.value.replace(",", ".");

      setCost(asStr);

      const asNum = Number(asStr);
      if (!isNaN(asNum)) dispatch(thunks.modItem({ id: itemId, cost: asNum }));
    },
  };

  return useMemo(
    () => ({
      updatingReceipt,
      isMultiUser,

      itemId,
      categoryId: item.categoryId,

      autoFocus,
      cost,
      handlers,
    }),
    [
      updatingReceipt,
      isMultiUser,

      itemId,
      item.categoryId,

      autoFocus,
      cost,
      handlers,
    ]
  );
}
