import { DataTypes, Model, ModelAttributes } from "sequelize";

import { dateAsInt } from "@/lib/utils";
import {
  SeqIdCols,
  seqInitOpts,
  REV_ID_INTEGER_PK,
  TIDs,
  TCrIDs,
} from "./common";
import { User } from "./user";

type TReceipt = TIDs & { paidOn: number; paidBy: number };

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
  },
  paidBy: {
    type: DataTypes.INTEGER,
    references: { model: User, key: "id" },
    allowNull: false,
  },
};

export class Receipt extends Model<TReceipt, TCrReceipt> {
  id!: number;
  revId?: number;
  statusId!: number;

  paidOn!: number;
  paidBy!: number;
}
Receipt.init(
  {
    ...COLS,
    paidOn: {
      type: DataTypes.INTEGER,
      defaultValue: () => dateAsInt(),
    },
  },
  {
    ...seqInitOpts,
    modelName: "Receipt",
  }
);

export class ReceiptArchive extends Receipt {}
ReceiptArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    tableName: "receipts_archive",
  }
);
