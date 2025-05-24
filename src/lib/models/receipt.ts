import { DataTypes, Model } from "sequelize";

import { dateAsInt } from "@/lib/utils";
import { SeqIdCols, SeqInitOpts, REV_ID_INTEGER_PK, TIDs } from "./common";
import { User } from "./user";

export type TReceipt = TIDs & { paidOn: number; paidBy: number };

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

export class Receipt extends Model {}
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
    ...SeqInitOpts,
    modelName: "Receipt",
  }
);

export class ReceiptArchive extends Model {}
ReceiptArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...SeqInitOpts,
    tableName: "receipts_archive",
  }
);
