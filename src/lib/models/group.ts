<<<<<<< HEAD
import { DataTypes, Model } from "sequelize";
import { v4 as uuid } from "uuid";

import { seqCols, seqInitOpts, TColSRI } from "./common";
import { has3ConsecutiveLetters } from "../utils";
import { User } from "./user";
import { Category } from "./category";
import { Membership } from "./membership";
import { Receipt } from "./receipt";

import { TParetoChartData } from "@/components/pareto/chart";
=======
import { has3ConsecutiveLetters } from "../utils";

import { COL_SRI, Model, TCrModelSRI, TModelSRI } from "./model";
import { TCategory } from "./category";
import { TMembership } from "./membership";
import { TUser } from "./user";

>>>>>>> better-sqlite3
import { TBalanceChartData } from "@/components/balance/chart";
import { TParetoChartData } from "@/components/pareto/chart";

<<<<<<< HEAD
export type TGroup = TColSRI & {
=======
type TGroupBase = {
>>>>>>> better-sqlite3
  name: string;
  description?: string;
  uuid?: string | null;
};

<<<<<<< HEAD
export type TCrGroup = Partial<TColSRI> & Pick<TGroup, "name" | "description">;

export class Group extends Model<TGroup, TCrGroup> {
  id!: number;
  revId!: number;
  statusId!: number;
=======
export type TGroup = TModelSRI &
  TGroupBase & {
    Users?: TUser[];
    Categories?: TCategory[];
    Archives?: TGroup[];
    Memberships?: TMembership[];

    Balance?: TBalanceChartData;
    Pareto?: TParetoChartData;
  };
>>>>>>> better-sqlite3

export type TCrGroup = TCrModelSRI & TGroupBase;

export const Groups = new Model<TGroup, TCrGroup>("groups", {
  ...COL_SRI,

<<<<<<< HEAD
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
=======
  name: {
    type: "string",
    required: true,
    validators: [has3ConsecutiveLetters],
  },
  description: {
    type: "string",
  },
  uuid: {
    type: "string",
    skipArchival: true,
  },
});
>>>>>>> better-sqlite3
