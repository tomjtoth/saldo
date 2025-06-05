"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  initReceiptAdder,
  setPaidBy,
  setPaidOn,
} from "@/lib/reducers/receipt-adder";
import { TCliCategory, TCliUser } from "@/lib/models";

import ItemRows from "./item-row";

export type TCLiReceiptAdder = {
  users: TCliUser[];
  categories: TCliCategory[];
  paidBy: number;
};

export default function CliReceiptAdder(props: TCLiReceiptAdder) {
  const dispatch = useAppDispatch();
  const paidOn = useAppSelector((s) => s.receiptAdder.paidOn);
  const paidBy = useAppSelector((s) => s.receiptAdder.paidBy);

  useEffect(() => {
    dispatch(initReceiptAdder(props));
  }, []);

  return (
    <>
      <div>
        <label htmlFor="paid-on">paid on:</label>
        <input
          required
          id="paid-on"
          type="date"
          value={paidOn}
          onChange={(ev) => dispatch(setPaidOn(ev.target.value))}
        />
      </div>

      <div>
        <label htmlFor="paid-by">paid by:</label>
        <select
          id="paid-by"
          value={paidBy}
          onChange={(ev) => dispatch(setPaidBy(ev.target.value))}
        >
          {props.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      <ItemRows />
    </>
  );
}
