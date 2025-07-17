import { COL_RS, Model, TCrModelSR, TModelSR } from "./model";
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

export const ItemShares = new Model<TItemShare, TCrItemShare>("itemShares", {
  ...COL_RS,

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
