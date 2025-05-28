import { DataTypes, Model, ModelAttributes } from "sequelize";

import { SeqIdCols, seqInitOpts, REV_ID_INTEGER_PK } from "./common";
import { Item } from "./item";
import { User } from "./user";

type TItemShare = {
  revId: number;
  itemId: number;
  userId: number;
  statusId: number;

  share: number;
};

export type TCrItemShare = Omit<TItemShare, "statusId"> &
  Partial<Pick<TItemShare, "statusId">>;

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<ItemShare, TItemShare> = {
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
  revId: SeqIdCols.revId,

  statusId: SeqIdCols.statusId,

  share: { type: DataTypes.INTEGER, allowNull: false },
};

export class ItemShare extends Model<TItemShare, TCrItemShare> {
  itemId!: number;
  userId!: number;
  revId!: number;
  statusId!: number;

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
