"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { appToast, err, sendJSON } from "@/lib/utils";

import Canceler from "../../canceler";
import ItemRow from "./itemRow";

const DIFFS = {
  ArrowUp: -1,
  ArrowDown: 1,
  PageUp: -5,
  PageDown: 5,
};

const Ctx = createContext<{
  setModal: (_: ReactNode) => void;
}>({ setModal: () => {} });

export const useModal = () => useContext(Ctx);

export default function Adder() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.combined.userId);
  const rs = useGroupSelector();
  const currReceipt = useAppSelector((s) =>
    rs.groupId ? s.combined.newReceipts[rs.groupId] : undefined
  );
  const [modal, setModal] = useState<ReactNode>(null);

  const submitReceipt = () => {
    const nanItem = currReceipt!.items.findIndex(
      (item) => item.cost === "" || isNaN(Number(item.cost))
    );

    if (nanItem > -1) {
      dispatch(red.setFocusedRow(nanItem));
      return toast.error("Invalid item cost", appToast.theme());
    }

    appToast.promise(
      sendJSON("/api/receipts", {
        ...currReceipt,
        groupId: rs.groupId,
      }).then(async (res) => {
        if (!res.ok) err(res.statusText);

        const body = await res.json();
        dispatch(red.addReceipt(body));
      }),
      "Submitting new receipt"
    );
  };

  useEffect(() => {
    if (!!userId && !currReceipt && (rs.group()?.categories?.length ?? 0) > 0)
      dispatch(red.addRow());
  }, [currReceipt, rs.groups, rs.groupId, userId]);

  const users = rs.users;
  const isMultiUser = users.length > 1;

  return !currReceipt ? null : (
    <Ctx.Provider value={{ setModal }}>
      <button className="border rounded" onClick={() => setOpen(true)}>
        Add new...
      </button>

      {modal}

      {open && (
        <Canceler onClick={() => setOpen(false)}>
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
                  value={currReceipt.paidOn}
                  onChange={(ev) => dispatch(red.setPaidOn(ev.target.value))}
                />
                <label htmlFor="paid-on">(paid on)</label>
              </div>

              <div className="flex gap-2 items-center">
                <span>
                  paid by{" "}
                  {isMultiUser
                    ? users.find((u) => u.id === currReceipt.paidBy)?.name
                    : "You"}
                </span>

                {isMultiUser && (
                  <select
                    id="paid-by"
                    className="rounded border p-1"
                    value={currReceipt.paidBy}
                    onChange={(ev) => dispatch(red.setPaidBy(ev.target.value))}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email}
                      </option>
                    ))}
                  </select>
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
              {currReceipt.items.map((item, rowIdx) => (
                <ItemRow
                  key={item.id}
                  autoFocus={rowIdx === currReceipt.focusedIdx}
                  itemId={item.id}
                  onKeyDown={(ev) => {
                    const lastIdx = currReceipt.items.length - 1;

                    if (
                      ((ev.key === "ArrowUp" || ev.key === "PageUp") &&
                        rowIdx > 0) ||
                      ((ev.key === "ArrowDown" || ev.key === "PageDown") &&
                        rowIdx < lastIdx)
                    ) {
                      ev.preventDefault();
                      const newIdx = rowIdx + DIFFS[ev.key];

                      dispatch(
                        red.setFocusedRow(
                          newIdx < 0 ? 0 : newIdx > lastIdx ? lastIdx : newIdx
                        )
                      );
                    } else if (ev.key === "Enter" && ev.ctrlKey)
                      submitReceipt();
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
                  className="rounded border p-1 w-15"
                  readOnly
                  value={currReceipt.items
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
      )}
    </Ctx.Provider>
  );
}
