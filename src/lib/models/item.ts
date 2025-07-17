import { COL_RSI, Model, TCrModelSRI, TModelSRI } from "./model";
import { TReceipt } from "./receipt";

type TItemBase = {
  receiptId: number;
  categoryId: number;
  cost: number;
  notes?: string;
};

export type TItem = TModelSRI &
  TItemBase & {
    Receipt?: TReceipt;
  };

export type TCrItem = TCrModelSRI & TItemBase;

export const Items = new Model<TItem, TCrItem>("items", {
  ...COL_RSI,

  receiptId: {
    type: "number",
    required: true,
  },
  categoryId: {
    type: "number",
    required: true,
  },
  cost: {
    type: "number",
    required: true,
    toJS: (fromDB) => (fromDB as number) / 100,
    toDB: (fromJS) => Math.round((fromJS as number) * 100),
  },
  notes: {
    type: "string",
  },
});
