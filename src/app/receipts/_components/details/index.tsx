"use client";

import { useState } from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { appToast, virt } from "@/app/_lib/utils";
import { callApi } from "@/app/_lib/utils/apiCalls";
import { Item } from "../../_lib";

import Canceler from "@/app/_components/canceler";
import ItemRow from "./itemRow";
import PaidByUserWithAvatar from "../paidByUserWithAvatar";

const DIFFS = {
  ArrowUp: -1,
  ArrowDown: 1,
  PageUp: -5,
  PageDown: 5,
};

export default function ReceiptDetails() {
  const nodes = useBodyNodes();
  const dispatch = useAppDispatch();
  const group = useClientState("group")!;
  const users = useClientState("users");

  const [zeros, setZeros] = useState<Item["id"][]>([]);

  const groupId = group.id;
  const receipt = group.activeReceipt!;

  const isMultiUser = users.length > 1;
  const paidBy = users.find((u) => u.id === receipt.paidById)!;

  function submitReceipt() {
    if (!virt(group).active) {
      return appToast.error(
        "Cannot update receipts in a disabled group, re-enable it first!"
      );
    }

    const zeroCostItems = receipt.items
      .filter((i) => i.cost === 0)
      .map((i) => i.id);

    if (zeroCostItems.length) {
      if (
        zeros.length !== zeroCostItems.length ||
        !zeros.every((id, idx) => id === zeroCostItems[idx])
      ) {
        setZeros(zeroCostItems);
        return void appToast.error(
          "Found items with € 0.00 cost. Were these for free?"
        );
      }
    }

    const updating = receipt.id !== -1;

    if (updating) {
      appToast.promise(
        "Updating receipt",

        callApi.modReceipt(receipt).then((res) => {
          nodes.pop();
          dispatch(thunks.setActiveReceipt());
          dispatch(thunks.modReceipt(res));
        })
      );
    } else {
      appToast.promise(
        "Submitting new receipt",

        callApi
          .addReceipt({
            ...receipt,
            groupId,
          })
          .then((res) => {
            nodes.pop();
            dispatch(thunks.setActiveReceipt());
            dispatch(thunks.addReceipt(res));
          })
      );
    }
  }

  return (
    <Canceler
      onClick={() => {
        nodes.setNodes([]);
        dispatch(thunks.setActiveReceipt());
      }}
    >
      <div
        className={
          "absolute left-1/2 top-1/2 -translate-1/2 w-4/5 h-4/5 " +
          "bg-background rounded border p-2 flex flex-col gap-2 overflow-scroll"
        }
      >
        <div className="flex gap-2 flex-wrap justify-between">
          <div className="flex flex-row gap-2 items-center">
            <input
              required
              id="paid-on"
              type="date"
              value={receipt.paidOn}
              onChange={(ev) => dispatch(thunks.setPaidOn(ev.target.value))}
            />
            <label className="hidden sm:inline-block" htmlFor="paid-on">
              paid on
            </label>
          </div>

          <div className="flex gap-2 items-center">
            {isMultiUser && (
              <PaidByUserWithAvatar
                id="paid-by"
                userId={paidBy.id}
                listOnClick
              />
            )}
          </div>
        </div>

        <h3>Items</h3>
        <hr />
        <div
          className={
            "p-2 grid items-center gap-2 " +
            "grid-cols-[auto_min-content_min-content] " +
            (isMultiUser
              ? "sm:grid-cols-[min-content_auto_min-content_min-content_min-content_min-content]"
              : "sm:grid-cols-[min-content_auto_min-content_min-content_min-content]")
          }
        >
          {receipt.items.map((item, rowIdx) => (
            <ItemRow
              key={item.id}
              autoFocus={rowIdx === receipt.focusedIdx}
              highlighted={zeros.includes(item.id)}
              itemId={item.id}
              onKeyDown={(ev) => {
                const lastIdx = receipt.items.length - 1;

                if (
                  ev.key === "ArrowUp" ||
                  ev.key === "PageUp" ||
                  ev.key === "ArrowDown" ||
                  ev.key === "PageDown"
                ) {
                  ev.preventDefault();
                  const newIdx = rowIdx + DIFFS[ev.key];

                  dispatch(
                    thunks.setFocusedRow(
                      newIdx < 0 ? 0 : newIdx > lastIdx ? lastIdx : newIdx
                    )
                  );
                } else if (ev.key === "s" && ev.ctrlKey) {
                  ev.preventDefault();
                  submitReceipt();
                }
              }}
            />
          ))}

          <span className="col-start-1">TOTAL</span>

          <button
            className={
              "inline-flex items-center gap-2 " +
              (isMultiUser ? "sm:col-start-5" : "sm:col-start-4") +
              (zeros.length > 0 ? " bg-amber-500" : "")
            }
            onClick={submitReceipt}
          >
            {zeros.length > 0 ? (
              <span className="hidden xl:block grow">Save anyways</span>
            ) : (
              <span className="hidden xl:block grow">Save & clear</span>
            )}
            💾
          </button>

          <span className="inline-flex items-center gap-2">
            €
            <input
              type="text"
              className="rounded border p-1 w-15 border-none!"
              readOnly
              value={receipt.items
                .reduce((sub, { cost }) => {
                  const asNum = Number(cost);
                  return sub + (isNaN(asNum) ? 0 : asNum);
                }, 0)
                .toFixed(2)}
            />
          </span>
        </div>
      </div>
    </Canceler>
  );
}
