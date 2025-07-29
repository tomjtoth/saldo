import { DataTypes, Model } from "sequelize";

import type { TCrIDs, TColSRI } from "./common";
import { seqCols, seqInitOpts } from "./common";
import { has3ConsecutiveLetters } from "../utils";
import { Membership } from "./membership";
import { Group } from "./group";

export type TUser = TColSRI & {
  email: string;
  name: string;
  image?: string;
  defaultGroupId?: number;

  Membership?: Membership;
  Groups?: Group[];
};

export type TCrUser = TCrIDs & Pick<TUser, "email" | "name">;

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
