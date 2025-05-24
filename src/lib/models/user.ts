import { DataTypes, Model } from "sequelize";

import type { TIDs } from "./common";
import {
  has3WordChars,
  SeqIdCols,
  SeqInitOpts,
  REV_ID_INTEGER_PK,
  Revision,
} from "./common";
import { db } from "./db";

export type TUser = TIDs & {
  email: string;
  name: string;
  passwd: string;
};

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

export class User extends Model {}

User.init(COLS, {
  ...SeqInitOpts,
  modelName: "User",
});

export async function createUser(userData: Omit<TUser, "revId">) {
  const transaction = await db.transaction();

  const user = await User.create(userData, { transaction });
  const rev = await Revision.create({ revBy: user.get("id") }, { transaction });
  user.set({
    revId: rev.get("id"),
  });
  user.save();

  await transaction.commit();

  return user;
}

export class UserArchive extends Model {}
UserArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...SeqInitOpts,
    tableName: "users_archive",
  }
);
