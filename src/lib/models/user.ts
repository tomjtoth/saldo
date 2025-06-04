import { DataTypes, Model, ModelAttributes } from "sequelize";

import type { TIDs } from "./common";
import {
  has3WordChars,
  SeqIdCols,
  seqInitOpts,
  REV_ID_INTEGER_PK,
} from "./common";

type TUser = TIDs & {
  email: string;
  name: string;
};

export type TCliUser = Omit<TUser, "revId" | "statusId">;
export type TCrUser = Partial<TIDs> & Pick<TUser, "email" | "name">;

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<User, TUser> = {
  ...SeqIdCols,

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
      has3WordChars,
    },
  },
};

export class User extends Model<TUser, TCrUser> {
  id!: number;
  revId?: number;
  statusId!: number;

  email!: string;
  name!: string;
}
User.init(COLS, {
  ...seqInitOpts,
  modelName: "User",
});

export class UserArchive extends User {}
UserArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    tableName: "users_archive",
  }
);
