import { DataTypes, Model, ModelAttributes } from "sequelize";

import {
  SeqIdCols,
  seqInitOpts,
  REV_ID_INTEGER_PK,
  TIDs,
  TCrIDs,
} from "./common";
import { Category } from "./category";
import { Receipt } from "./receipt";

type TItem = TIDs & {
  rcptId: number;
  catId: number;
  cost: number;
  notes?: string;
};

export type TCrItem = TCrIDs &
  Pick<TItem, "rcptId" | "catId" | "cost" | "notes">;

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<Item, TItem> = {
  ...SeqIdCols,
  rcptId: {
    type: DataTypes.INTEGER,
    references: { model: Receipt, key: "id" },
  },
  catId: {
    type: DataTypes.INTEGER,
    references: { model: Category, key: "id" },
  },
  cost: { type: DataTypes.INTEGER, allowNull: false },
  notes: { type: DataTypes.TEXT },
};

export class Item extends Model<TItem, TCrItem> {
  id!: number;
  revId!: number;

  rcptId!: number;
  catId!: number;
  statusId!: number;

  cost!: number;
  notes?: string;
}
Item.init(COLS, {
  ...seqInitOpts,
  modelName: "Item",
});

export class ItemArchive extends Item {}
ItemArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    tableName: "items_archive",
  }
);
