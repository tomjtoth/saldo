import { DataTypes, Model } from "sequelize";

import { SeqIdCols, SeqInitOpts, REV_ID_INTEGER_PK, TIDs } from "./common";
import { Receipt } from "./receipt";
import { Category } from "./category";

export type TItem = TIDs & {
  rcptId: number;
  catId: number;
  cost: number;
  notes?: string;
};

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS = {
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

export class Item extends Model {}
Item.init(COLS, {
  ...SeqInitOpts,
  modelName: "Item",
});

export class ItemArchive extends Model {}
ItemArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...SeqInitOpts,
    tableName: "items_archive",
  }
);
