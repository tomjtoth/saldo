import { ModelSRI, TCrModelSRI, TModelSRI } from "./model";

type TItemBase = {
  receiptId: number;
  categoryId: number;
  cost: number;
  notes?: string;
};

export type TItem = TModelSRI & TItemBase;
export type TCrItem = TCrModelSRI & TItemBase;

export const Items = new ModelSRI<TItem, TCrItem>(
  "items",
  {
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
    },
    notes: {
      type: "string",
    },
  },
  {
    toJS: (row) => ({ ...row, cost: row.cost / 100 }),
    toDB: (obj) => ({ ...obj, cost: Math.round(obj.cost * 100) }),
  }
);
