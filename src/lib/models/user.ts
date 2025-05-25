import { DataTypes, Model } from "sequelize";

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
  passwd: string;
};

export type TCrUser = Partial<TIDs> & Pick<TUser, "email" | "name" | "passwd">;

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS = {
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

  passwd: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
};

export class User extends Model<TUser, TCrUser> {
  id!: number;
  revId?: number;
  statusId!: number;

  email!: string;
  name!: string;
  passwd!: string;
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
