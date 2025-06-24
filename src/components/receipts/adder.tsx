"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { TCategory, TUser } from "@/lib/models";

import Canceler from "../canceler";
import ItemRows from "./item-row";

export type TCLiReceiptAdder = {
  users: TUser[];
  categories: TCategory[];
  paidBy: number;
};

export default function Adder() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const currReceipt = useAppSelector((s) =>
    rs.groupId ? s.combined.newReceipts[rs.groupId] : undefined
  );

  useEffect(() => {
    if (rs.groups.length > 0 && !currReceipt) dispatch(red.addRow());
  }, [currReceipt, rs.groups.length]);

  return !currReceipt ? null : (
    <>
      <button className="border rounded" onClick={() => setOpen(true)}>
        Add new...
      </button>
      {open && (
        <Canceler onClick={() => setOpen(false)}>
          <div
            className={
              "absolute left-1/2 top-1/2 -translate-1/2 w-8/10 h-8/10 " +
              "bg-background border rounded p-2 flex flex-col gap-2 " +
              "overflow-scroll"
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
                <span>paid by:</span>
                <select
                  id="paid-by"
                  className="rounded border p-1"
                  value={currReceipt.paidBy}
                  onChange={(ev) => dispatch(red.setPaidBy(ev.target.value))}
                >
                  {rs.group()?.Users?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ItemRows />
          </div>
        </Canceler>
      )}
    </>
  );
}
