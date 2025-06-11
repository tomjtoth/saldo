import { DataTypes, Model, ModelAttributes } from "sequelize";

import {
  SeqIdCols,
  seqInitOpts,
  REV_ID_INTEGER_PK,
  TIDs,
  TCrIDs,
  Status,
  Revision,
} from "./common";
import { Category } from "./category";
import { Receipt } from "./receipt";
import { ItemShare } from "./item_share";

export type TItem = TIDs & {
  rcptId: number;
  catId: number;
  cost: number;
  notes?: string;

  Revision?: Revision;
  Status?: Status;
  Receipt?: Receipt;
  Category?: Category;

  shares?: ItemShare[];
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

class Common extends Model<TItem, TCrItem> {
  id!: number;
  revId!: number;
  statusId!: number;

  rcptId!: number;
  catId!: number;
  cost!: number;
  notes?: string;

  Revision?: Revision;
  Status?: Status;
  Receipt?: Receipt;
  Category?: Category;

  shares?: ItemShare[];
}

export class Item extends Common {
  archives?: ItemArchive[];
}

Item.init(COLS, {
  ...seqInitOpts,
  modelName: "Item",
});

export class ItemArchive extends Common {
  current?: Item;
}

ItemArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    modelName: "ItemArchive",
    tableName: "items_archive",
  }
);
