import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";

import { seqCols, seqInitOpts, TColSRI } from "./common";
import { has3ConsecutiveLetters } from "../utils";
import { User } from "./user";
import { Category } from "./category";
import { Membership } from "./membership";
import { Receipt } from "./receipt";

import { TParetoChartData } from "@/components/pareto/chart";
import { TBalanceChartData } from "@/components/balance/chart";

export type TGroup = TColSRI & {
  name: string;
  description?: string;
  uuid?: string | null;

  Users?: User[];
  Categories?: Category[];
  Receipts?: Receipt[];
  Memberships?: Membership[];

  pareto?: TParetoChartData;
  balance?: TBalanceChartData;
};

export type TCrGroup = Partial<TColSRI> & Pick<TGroup, "name" | "description">;

export class Group extends Model<TGroup, TCrGroup> {
  id!: number;
  revId!: number;
  statusId!: number;

  name!: string;
  description?: string;
  uuid?: string | null;

  Users?: User[];
  Categories?: Category[];
  Receipts?: Receipt[];
  Memberships?: Membership[];

  pareto?: TParetoChartData;
  balance?: TBalanceChartData;
}

Group.init(
  {
    ...seqCols.SRI,

    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        has3ConsecutiveLetters,
      },
    },

    description: {
      type: DataTypes.TEXT,
    },

    uuid: {
      type: DataTypes.TEXT,
      defaultValue: uuid,
    },
  },

  seqInitOpts("Group")
);
