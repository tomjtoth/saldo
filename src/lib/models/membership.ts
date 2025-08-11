<<<<<<< HEAD
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
=======
import { COL_SRI, Model, TCrModelSR, TModelSR } from "./model";
import { TGroup } from "./group";
import { TUser } from "./user";

type TMembershipBase = {
  groupId: number;
  userId: number;
  defaultCategoryId?: number;
  isAdmin: boolean;
>>>>>>> better-sqlite3
};

export type TMembership = TModelSR &
  TMembershipBase & {
    Group?: TGroup;
    User?: TUser;
  };

<<<<<<< HEAD
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
=======
export type TCrMembership = TCrModelSR &
  Pick<TMembershipBase, "groupId" | "userId"> &
  Partial<Pick<TMembershipBase, "isAdmin" | "defaultCategoryId">>;

export const Memberships = new Model<TMembership, TCrMembership>(
  "memberships",
  {
    ...COL_SRI,

    groupId: {
      type: "number",
      primaryKey: true,
    },
    userId: {
      type: "number",
      primaryKey: true,
    },
    defaultCategoryId: {
      type: "number",
    },
    isAdmin: {
      type: "boolean",
    },
  }
>>>>>>> better-sqlite3
);
