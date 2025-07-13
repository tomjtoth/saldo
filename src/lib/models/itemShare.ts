import { ModelSR, TCrModelSR, TModelSR } from "./model";

type TItemShareBase = {
  itemId: number;
  userId: number;
  share: number;
};

export type TItemShare = TModelSR & TItemShareBase;
export type TCrItemShare = TCrModelSR & TItemShareBase;

export const ItemShares = new ModelSR<TItemShare, TCrItemShare>("itemShares", {
  itemId: {
    type: "number",
    primaryKey: true,
  },

  userId: {
    type: "number",
    primaryKey: true,
  },

  share: {
    type: "number",
    required: true,
  },
});
