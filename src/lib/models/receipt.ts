import { dateFromInt, dateToInt, isISODate } from "@/lib/utils";
import { ModelSRI, TCrModelSRI, TModelSRI } from "./model";

type TReceiptBase = {
  groupId: number;
  paidOn: string;
  paidBy: number;
};

export type TReceipt = TModelSRI & TReceiptBase;
export type TCrReceipt = TCrModelSRI & TReceiptBase;

type TDbReceipt = Omit<TReceipt, "paidOn"> & { paidOn: number };

export const Receipts = new ModelSRI<TReceipt, TCrModelSRI, TDbReceipt>(
  "receipts",
  {
    groupId: {
      type: "number",
      required: true,
    },
    paidOn: {
      type: "string",
      required: true,
      validators: [isISODate],
    },
    paidBy: {
      type: "number",
      required: true,
    },
  },
  {
    toJS: (row) => ({
      ...row,
      paidOn: dateFromInt(row.paidOn),
    }),
    toDB: (obj) => ({
      ...obj,
      paidOn: dateToInt(obj.paidOn),
    }),
  }
);
