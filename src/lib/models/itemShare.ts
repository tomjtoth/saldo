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
};

export type TCrItemShare = Omit<TItemShare, "statusId"> &
  Partial<Pick<TItemShare, "statusId">>;

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
