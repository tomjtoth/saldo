import { dateFromInt, dateToInt, isISODate } from "@/lib/utils";
import { ModelSRI, TCrModelSRI, TModelSRI } from "./model";
import { TGroup } from "./group";
import { TUser } from "./user";

type TReceiptBase = {
  groupId: number;
  paidOn: string;
  paidBy: number;
};

export type TReceipt = TModelSRI &
  TReceiptBase & {
    Group?: TGroup;
    Payer?: TUser;
  };

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
      toJS: (val) => dateFromInt(val as number),
      toDB: (val) => dateToInt(val as string),
    },
    paidBy: {
      type: "number",
      required: true,
    },
  }
);
