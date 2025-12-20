"use client";

import {
  KeyboardEventHandler,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useAppDispatch,
  useBodyNodes,
  useClientState,
  useDebugger,
} from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { Item } from "@/app/receipts/_lib";
import { virt } from "@/app/_lib/utils";

import ItemShareSetter from "./options/shares/setter";

const RE_OTHER_THAN_NUM_CHARS = /^[^\d,.-]$/;

export default function useItemRowLogic(itemId: Item["id"]) {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const group = useClientState("group")!;
  const users = useClientState("users");

  const categoryRef = useRef<HTMLSelectElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const sharesRef = useRef<HTMLDivElement>(null);
  const rmRowRef = useRef<HTMLButtonElement>(null);
  const addRowRef = useRef<HTMLButtonElement>(null);
  const costRef = useRef<HTMLInputElement>(null);

  const refs = {
    categoryRef,
    notesRef,
    sharesRef,
    rmRowRef,
    addRowRef,
    costRef,
  };

  const receipt = group.activeReceipt!;
  const updatingReceipt = receipt.id !== -1;
  const itemIdx = receipt.items.findIndex((i) => i.id === itemId);
  const item = receipt.items[itemIdx];
  const isMultiUser = users.length > 1;
  const autoFocus = itemId === receipt.focusedItemId;
  const disabled = useMemo(() => !virt(item).active, [item]);

  const caretRef = useRef(-1);
  const [cost, setCost] = useState(item.cost === 0 ? "" : item.cost.toFixed(2));

  useLayoutEffect(() => {
    const caretPos = caretRef.current;
    if (caretPos !== -1) {
      costRef.current?.setSelectionRange(caretPos, caretPos, "none");
      caretRef.current = -1;
    }
  });

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

      const navi = {
        ArrowUp: -1,
        ArrowDown: 1,
        PageUp: -5,
        PageDown: 5,
      };

      if (ev.key in navi) {
        ev.preventDefault();

        const activeItems = receipt.items.filter(virt.active);
        const itemIdx = activeItems.findIndex((i) => i.id === itemId);

        const lastIdx = activeItems.length - 1;
        const newIdx = itemIdx + navi[ev.key as keyof typeof navi];

        dispatch(
          thunks.focusItem(
            activeItems[newIdx < 0 ? 0 : newIdx > lastIdx ? lastIdx : newIdx].id
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
        (isMultiUser ? sharesRef.current : rmRowRef.current)?.focus();
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
        ArrowLeft: (isMultiUser ? sharesRef : notesRef).current,
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
        caretRef.current = t.selectionStart! + (alreadyMinus ? -1 : 1);

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

  const itemRowLogic = useMemo(
    () => ({
      updatingReceipt,
      isMultiUser,

      categoryId: item.categoryId,
      disabled,

      autoFocus,
      cost,
      handlers,
      refs,
    }),
    [
      updatingReceipt,
      isMultiUser,

      item.categoryId,
      disabled,

      autoFocus,
      cost,
      handlers,
      refs,
    ]
  );

  useDebugger({ itemId, itemRowLogic });

  return itemRowLogic;
}
