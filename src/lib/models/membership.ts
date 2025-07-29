import { DataTypes, Model } from "sequelize";

import { seqCols, seqInitOpts } from "./common";
import { Category } from "./category";

export type TMembership = {
  groupId: number;
  userId: number;
  revId: number;
  statusId: number;
  defaultCatId?: number;

  admin: boolean;
};

type TCrMembership = Pick<TMembership, "groupId" | "userId" | "revId"> &
  Partial<Pick<TMembership, "admin" | "statusId">>;

export class Membership extends Model<TMembership, TCrMembership> {
  groupId!: number;
  userId!: number;
  revId!: number;
  statusId!: number;
  defaultCatId?: number;

  admin!: boolean;
}

Membership.init(
  {
    ...seqCols.SR,

    groupId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },

    defaultCatId: {
      type: DataTypes.INTEGER,
      references: { model: Category, key: "id" },
    },

    admin: {
      type: DataTypes.VIRTUAL,

      get() {
        const int = this.getDataValue("statusId");
        return int & 2;
      },

      set(state: boolean) {
        let int = this.getDataValue("statusId");
        int = state ? int | (1 << 1) : int & ~(1 << 1);
        this.setDataValue("statusId", int);
      },
    },
  },

  seqInitOpts("Membership")
);
