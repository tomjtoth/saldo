import { DataTypes, Model } from "sequelize";

import { SeqIdCols, SeqInitOpts, REV_ID_INTEGER_PK } from "./common";
import { Item } from "./item";
import { User } from "./user";

export type TItemShare = {
  statusId?: number;
  itemId: number;
  revId: number;
  userId: number;

  share: number;
};

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS = {
  revId: SeqIdCols.revId,
  statusId: SeqIdCols.statusId,

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
};

export class ItemShare extends Model {}
ItemShare.init(COLS, {
  ...SeqInitOpts,
  modelName: "ItemShare",
});

export class ItemShareArchive extends Model {}
ItemShareArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...SeqInitOpts,
    tableName: "item_shares_archive",
  }
);
