<<<<<<< HEAD
import { DataTypes, Model } from "sequelize";

import type { TCrIDs, TColSRI } from "./common";
import { seqCols, seqInitOpts } from "./common";
import { has3ConsecutiveLetters } from "../utils";
import { Membership } from "./membership";
import { Group } from "./group";

export type TUser = TColSRI & {
=======
import { has3ConsecutiveLetters, isEmail } from "../utils";
import { COL_SRI, Model, TCrModelSRI, TModelSRI } from "./model";
import { TGroup } from "./group";
import { TMembership } from "./membership";

type TUserBase = {
>>>>>>> better-sqlite3
  email: string;
  name: string;
  image?: string;
  defaultGroupId?: number;
};

export type TUser = TModelSRI &
  TUserBase & {
    Memberships?: TMembership[];
    Groups?: TGroup[];
  };

<<<<<<< HEAD
export class User extends Model<TUser, TCrUser> {
  id!: number;
  revId?: number;
  statusId!: number;
  email!: string;
  name!: string;
  image?: string;
  defaultGroupId?: number;

  Membership?: Membership[];
  Groups?: Group[];
}

User.init(
  {
    ...seqCols.SRI,

    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        has3ConsecutiveLetters,
      },
    },

    image: {
      type: DataTypes.TEXT,
    },

    defaultGroupId: {
      type: DataTypes.INTEGER,
      references: { model: Group, key: "id" },
    },
  },

  seqInitOpts("User")
);
=======
export type TCrUser = TCrModelSRI & TUserBase;

export const Users = new Model<TUser, TCrUser>("users", {
  ...COL_SRI,

  email: {
    type: "string",
    required: true,
    validators: [isEmail],
  },

  name: {
    type: "string",
    required: true,
    validators: [has3ConsecutiveLetters],
  },

  image: {
    type: "string",
  },

  defaultGroupId: {
    type: "number",
  },
});
>>>>>>> better-sqlite3
