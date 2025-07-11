import { DataTypes, Model, ModelAttributes } from "sequelize";

import { dateFromInt, dateToInt } from "@/lib/utils";
import {
  seqIdCols,
  seqInitOpts,
  REV_ID_INTEGER_PK,
  TIDs,
  TCrIDs,
  Revision,
  Status,
} from "./common";
import { User } from "./user";
import { Item } from "./item";
import { Group } from "./group";

export type TReceipt = TIDs & {
  groupId: number;
  paidOn: number | string;
  paidBy: number;

  Revision?: Revision;
  Status?: Status;
  User?: User;
  Items?: Item[];

  archives?: TReceipt[];
  current?: TReceipt;
};

export type TCrReceipt = TCrIDs &
  Partial<Pick<TReceipt, "paidOn">> &
  Pick<TReceipt, "paidBy" | "groupId">;

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<Receipt, TReceipt> = {
  ...seqIdCols,
  groupId: {
    type: DataTypes.INTEGER,
    references: { model: Group, key: "id" },
  },
  paidOn: {
    type: DataTypes.INTEGER,
    defaultValue: dateToInt,

    get() {
      const raw = this.getDataValue("paidOn") as number;
      return dateFromInt(raw);
    },

    set(val: string) {
      const int = dateToInt(val);
      this.setDataValue("paidOn", int);
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
  groupId!: number;

  paidOn!: number;
  paidBy!: number;

  Revision?: Revision;
  Status?: Status;
  User?: User;

  Items?: Item[];
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
