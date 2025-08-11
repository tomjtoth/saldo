<<<<<<< HEAD
import { DataTypes, Model } from "sequelize";

import { seqInitOpts, Revision, TColSR, seqCols } from "./common";
import { Item } from "./item";
import { User } from "./user";

type TItemShare = TColSR & {
  itemId: number;
  userId: number;

  share: number;

  Item?: Item;
  User?: User;
  Revision?: Revision;
=======
import { COL_SR, Model, TCrModelSR, TModelSR } from "./model";
import { TItem } from "./item";
import { TUser } from "./user";

type TItemShareBase = {
  itemId: number;
  userId: number;
  share: number;
>>>>>>> better-sqlite3
};

export type TItemShare = TModelSR &
  TItemShareBase & {
    Item?: TItem;
    User?: TUser;
  };

export type TCrItemShare = TCrModelSR & TItemShareBase;

export const ItemShares = new Model<TItemShare, TCrItemShare>("itemShares", {
  ...COL_SR,

<<<<<<< HEAD
export class ItemShare extends Model<TItemShare, TCrItemShare> {
  itemId!: number;
  userId!: number;
  revId!: number;
  statusId!: number;

  share!: number;

  Item?: Item;
  User?: User;
  Revision?: Revision;
}

ItemShare.init(
  {
    ...seqCols.SR,

    itemId: {
      type: DataTypes.INTEGER,
      references: { model: Item, key: "id" },
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      references: { model: User, key: "id" },
      primaryKey: true,
    },

    share: { type: DataTypes.INTEGER, allowNull: false },
  },

  seqInitOpts("ItemShare")
);
=======
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
>>>>>>> better-sqlite3
