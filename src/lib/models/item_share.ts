import { DataTypes, Model, ModelAttributes } from "sequelize";

import {
  seqIdCols,
  seqInitOpts,
  REV_ID_INTEGER_PK,
  Revision,
  Status,
} from "./common";
import { Item } from "./item";
import { User } from "./user";

type TItemShare = {
  itemId: number;
  userId: number;
  revId: number;
  statusId: number;

  share: number;

  Item?: Item;
  User?: User;
  Revision?: Revision;
  Status?: Status;
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
  revId: seqIdCols.revId,

  statusId: seqIdCols.statusId,

  share: { type: DataTypes.INTEGER, allowNull: false },
};

class Common extends Model<TItemShare, TCrItemShare> {
  itemId!: number;
  userId!: number;
  revId!: number;
  statusId!: number;

  share!: number;

  Item?: Item;
  User?: User;
  Revision?: Revision;
  Status?: Status;
}

export class ItemShare extends Common {
  archives?: ItemShareArchive[];
}

ItemShare.init(COLS, {
  ...seqInitOpts,
  modelName: "ItemShare",
});

export class ItemShareArchive extends Common {
  current?: ItemShare;
}

ItemShareArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    modelName: "ItemShareArchive",
    tableName: "item_shares_archive",
  }
);
