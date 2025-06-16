"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { rReceipts as red } from "@/lib/reducers/receipts";
import { TCategory, TUser } from "@/lib/models";

import Canceler from "../canceler";
import ItemRows from "./item-row";

export type TCLiReceiptAdder = {
  users: TUser[];
  categories: TCategory[];
  paidBy: number;
};

export function CliReceiptAdder(props: TCLiReceiptAdder) {
  const dispatch = useAppDispatch();
  const paidOn = useAppSelector((s) => s.receipts.paidOn);
  const paidBy = useAppSelector((s) => s.receipts.paidBy);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(red.init(props));
  }, []);

  return (
    <>
      <button className="p-2 border rounded" onClick={() => setOpen(true)}>
        ➕
      </button>
      {open && (
        <>
          <Canceler onClick={() => setOpen(false)} />

          <div className="absolute left-1/2 top-1/2 -translate-1/2 w-8/10 h-8/10 bg-background border rounded p-2">
            <div>
              <label htmlFor="paid-on">paid on:</label>
              <input
                required
                id="paid-on"
                type="date"
                value={paidOn}
                onChange={(ev) => dispatch(red.setPaidOn(ev.target.value))}
              />
            </div>

            <div>
              <label htmlFor="paid-by">paid by:</label>
              <select
                id="paid-by"
                value={paidBy}
                onChange={(ev) => dispatch(red.setPaidBy(ev.target.value))}
              >
                {props.users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <ItemRows />
          </div>
        </>
      )}
    </>
  );
}
