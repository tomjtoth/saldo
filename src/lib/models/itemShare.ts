import { ModelSR, TCrModelSR, TModelSR } from "./model";
import { TItem } from "./item";
import { TUser } from "./user";

type TItemShareBase = {
  itemId: number;
  userId: number;
  share: number;
};

export type TItemShare = TModelSR &
  TItemShareBase & {
    Item?: TItem;
    User?: TUser;
  };

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
