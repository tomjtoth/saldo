import { DataTypes, Model, ModelAttributes } from "sequelize";

import type { TCrIDs, TIDs } from "./common";
import { SeqIdCols, seqInitOpts, REV_ID_INTEGER_PK } from "./common";
import { has3WordChars } from "../utils";

export type TUser = TIDs & {
  email: string;
  name: string;
};

export type TCrUser = TCrIDs & Pick<TUser, "email" | "name">;

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

class Common extends Model<TUser, TCrUser> {
  id!: number;
  revId?: number;
  statusId!: number;
  email!: string;
  name!: string;
}

export class User extends Common {
  archives?: UserArchive[];
}

User.init(COLS, {
  ...seqInitOpts,
  modelName: "User",
});

export class UserArchive extends Common {
  current?: User;
}

UserArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    modelName: "UserArchive",
    tableName: "users_archive",
  }
);
