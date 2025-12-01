"use client";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { appToast } from "@/app/_lib/utils";
import { apiAddReceipt, apiModReceipt } from "../../_lib";

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

  const groupId = group.id;
  const receipt = group.activeReceipt!;

  const users = group.users;
  const isMultiUser = users.length > 1;

  const paidBy = users.find((u) => u.id === receipt.paidById)!;

  function submitReceipt() {
    const nanItem = receipt.items.findIndex((item) => item.cost === 0);

    if (nanItem > -1) {
      dispatch(thunks.setFocusedRow(nanItem));
      return appToast.error("Invalid item cost");
    }

    const updating = receipt.id !== -1;

    if (updating) {
      appToast.promise(
        "Updating receipt",

        apiModReceipt(receipt).then((res) => {
          nodes.pop();
          dispatch(thunks.setActiveReceipt());
          dispatch(thunks.modReceipt(res));
        })
      );
    } else {
      appToast.promise(
        "Submitting new receipt",

        apiAddReceipt({
          ...receipt,
          groupId,
        }).then((res) => {
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
        nodes.clear();
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
              <PaidByUserWithAvatar userId={paidBy.id} listOnClick />
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
              itemId={item.id}
              onKeyDown={(ev) => {
                const lastIdx = receipt.items.length - 1;

                if (
                  ((ev.key === "ArrowUp" || ev.key === "PageUp") &&
                    rowIdx > 0) ||
                  ((ev.key === "ArrowDown" || ev.key === "PageDown") &&
                    rowIdx < lastIdx)
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
              (isMultiUser ? "sm:col-start-5" : "sm:col-start-4")
            }
            onClick={submitReceipt}
          >
            <span className="hidden xl:block grow">Save & clear</span>
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
