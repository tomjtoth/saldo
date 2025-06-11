import { DataTypes, Model, ModelAttributes } from "sequelize";

import { dateAsInt } from "@/lib/utils";
import {
  SeqIdCols,
  seqInitOpts,
  REV_ID_INTEGER_PK,
  TIDs,
  TCrIDs,
  Revision,
  Status,
} from "./common";
import { User } from "./user";
import { Item } from "./item";

export type TReceipt = TIDs & {
  paidOn: number;
  paidBy: number;

  Revision?: Revision;
  Status?: Status;
  User?: User;

  items?: Item[];
};

export type TCrReceipt = TCrIDs &
  Partial<Pick<TReceipt, "paidOn">> &
  Pick<TReceipt, "paidBy">;

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<Receipt, TReceipt> = {
  ...SeqIdCols,
  paidOn: {
    type: DataTypes.INTEGER,
    defaultValue: () => dateAsInt(),
    get() {
      const str = this.getDataValue("paidOn").toString();
      return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6)}`;
    },
  },
  paidBy: {
    type: DataTypes.INTEGER,
    references: { model: User, key: "id" },
    allowNull: false,
  },
};

class Common extends Model<TReceipt, TCrReceipt> {
  id!: number;
  revId?: number;
  statusId!: number;

  paidOn!: number;
  paidBy!: number;

  Revision?: Revision;
  Status?: Status;
  User?: User;

  items?: Item[];
}

export class Receipt extends Common {
  archives?: ReceiptArchive[];
}

Receipt.init(COLS, {
  ...seqInitOpts,
  modelName: "Receipt",
});

export class ReceiptArchive extends Common {
  current?: Receipt;
}

ReceiptArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    modelName: "ReceiptArchive",
    tableName: "receipts_archive",
  }
);
