import { DataTypes, Model } from "sequelize";

import { SeqIdCols, seqInitOpts, REV_ID_INTEGER_PK } from "./common";
import { Item } from "./item";
import { User } from "./user";

type TItemShare = {
  statusId: number;
  itemId: number;
  revId: number;
  userId: number;

  share: number;
};

export type TCrItemShare = Omit<TItemShare, "statusId"> &
  Partial<Pick<TItemShare, "statusId">>;

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

export class ItemShare extends Model<TItemShare, TCrItemShare> {
  statusId!: number;
  itemId!: number;
  revId!: number;
  userId!: number;

  share!: number;
}
ItemShare.init(COLS, {
  ...seqInitOpts,
  modelName: "ItemShare",
});

export class ItemShareArchive extends ItemShare {}
ItemShareArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    tableName: "item_shares_archive",
  }
);
