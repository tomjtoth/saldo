import { DataTypes, Model } from "sequelize";

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
const COLS = {
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
      // TODO: get Sequelize to handle my obfuscated data schemes
      // get() {
      //   const YYYYMMDD = `${this.getDataValue("paidOn")}`;
      //   const YYYY = YYYYMMDD.slice(0, 4);
      //   const MM = YYYYMMDD.slice(4, 6);
      //   const DD = YYYYMMDD.slice(6);
      //   const YYYY_MM_DD = `${YYYY}-${MM}-${DD}`;

      //   return new Date(YYYY_MM_DD);
      // },
      // set(value: Date) {
      //   const YYYY_MM_DD = value.toISOString().slice(0, 10);
      //   const YYYYMMDD = parseInt(YYYY_MM_DD.replaceAll("-", ""));
      //   this.setDataValue("paidOn", YYYYMMDD);
      // },
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
