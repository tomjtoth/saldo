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
);
