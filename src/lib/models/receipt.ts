<<<<<<< HEAD
import { DataTypes, Model } from "sequelize";

import { dateFromInt, dateToInt } from "@/lib/utils";
import { seqInitOpts, TColSRI, Revision, seqCols } from "./common";
import { User } from "./user";
import { Item } from "./item";
import { Group } from "./group";

export type TReceipt = TColSRI & {
  groupId: number;
  paidOnInt: number;
  paidOn: string;
  paidById: number;

  Revision?: Revision;
  paidBy?: User;
  Items?: Item[];
};

export type TCrReceipt = Partial<TColSRI> &
  Partial<Pick<TReceipt, "paidOnInt">> &
  Pick<TReceipt, "paidBy" | "groupId">;

export class Receipt extends Model<TReceipt, TCrReceipt> {
  id!: number;
  revisionId?: number;
  statusId!: number;
  groupId!: number;

  paidOnInt!: number;
  paidBy!: number;

  paidOn!: string;
  Revision?: Revision;
  User?: User;

  Items?: Item[];
}

Receipt.init(
  {
    ...seqCols.SRI,

    groupId: {
      type: DataTypes.INTEGER,
      references: { model: Group, key: "id" },
    },

    paidOnInt: {
      type: DataTypes.INTEGER,
      field: "paid_on",
      defaultValue: dateToInt,
    },

    paidOn: {
      type: DataTypes.VIRTUAL,

      get() {
        const raw = this.getDataValue("paidOnInt");
        return dateFromInt(raw);
      },

      set(val: string) {
        const int = dateToInt(val);
        this.setDataValue("paidOnInt", int);
      },
    },

    paidById: {
      type: DataTypes.INTEGER,
      references: { model: User, key: "id" },
      allowNull: false,
    },
  },

  seqInitOpts("Receipt")
=======
import { dateFromInt, dateToInt, isISODate } from "@/lib/utils";
import { COL_SRI, Model, TCrModelSRI, TModelSRI } from "./model";
import { TGroup } from "./group";
import { TUser } from "./user";

type TReceiptBase = {
  groupId: number;
  paidOn: string;
  paidBy: number;
};

export type TReceipt = TModelSRI &
  TReceiptBase & {
    Group?: TGroup;
    Payer?: TUser;
  };

export type TCrReceipt = TCrModelSRI & TReceiptBase;

type TDbReceipt = Omit<TReceipt, "paidOn"> & { paidOn: number };

export const Receipts = new Model<TReceipt, TCrModelSRI, TDbReceipt>(
  "receipts",
  {
    ...COL_SRI,

    groupId: {
      type: "number",
      required: true,
    },
    paidOn: {
      type: "string",
      required: true,
      validators: [isISODate],
      toJS: (val) => dateFromInt(val as number),
      toDB: (val) => dateToInt(val as string),
    },
    paidBy: {
      type: "number",
      required: true,
    },
  }
>>>>>>> better-sqlite3
);
