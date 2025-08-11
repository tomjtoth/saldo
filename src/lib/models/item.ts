import { DataTypes, Model } from "sequelize";

import { seqInitOpts, TColSRI, Revision, seqCols } from "./common";
import { Category } from "./category";
import { Receipt } from "./receipt";
import { ItemShare } from "./itemShare";

export type TItem = TColSRI & {
  rcptId: number;
  catId: number;
  cost: number;
  notes?: string;

  Revision?: Revision;
  Receipt?: Receipt;
  Category?: Category;

  shares?: ItemShare[];
};

export type TCrItem = Partial<TColSRI> &
  Pick<TItem, "rcptId" | "catId" | "cost" | "notes">;

export class Item extends Model<TItem, TCrItem> {
  id!: number;
  revId!: number;
  statusId!: number;

  rcptId!: number;
  catId!: number;
  cost!: number;
  notes?: string;

  Revision?: Revision;
  Receipt?: Receipt;
  Category?: Category;

  shares?: ItemShare[];

  get archives() {
    return;
  }
}

Item.init(
  {
    ...seqCols.SRI,

    rcptId: {
      type: DataTypes.INTEGER,
      references: { model: Receipt, key: "id" },
    },
    catId: {
      type: DataTypes.INTEGER,
      references: { model: Category, key: "id" },
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: false,

      get() {
        return this.getDataValue("cost") / 100;
      },

      set(val: number) {
        this.setDataValue("cost", Math.round(val * 100));
      },
    },
    notes: { type: DataTypes.TEXT },
  },

  seqInitOpts("Item")
);
