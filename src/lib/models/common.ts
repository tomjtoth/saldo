import { DataTypes, Model } from "sequelize";

import { db } from "./db";

export type TIDs = {
  id?: number;
  revId: number;
  statusId?: number;
};

export const SeqInitOpts = {
  sequelize: db,
  timestamps: false,
  underscored: true,
};

// const id = {
//   type: DataTypes.INTEGER,
//   primaryKey: true,
//   autoIncrement: true,
// };

export type TRevision = {
  id: number;
  revOn: number;
  revBy: number;
};

export class Revision extends Model {}
Revision.init(
  {
    // id,
    revOn: {
      type: DataTypes.INTEGER,
      defaultValue: () => Date.now(),
    },
    revBy: {
      type: DataTypes.INTEGER,
      references: { model: "users", key: "id" },
    },
  },

  {
    ...SeqInitOpts,
    modelName: "Revision",
  }
);

export type TStatus = {
  id: number;
  description: string;
};

export class Status extends Model {}
Status.init(
  {
    // id,
    description: { type: DataTypes.TEXT, allowNull: false },
  },

  {
    ...SeqInitOpts,
    modelName: "Status",
  }
);

export const SeqIdCols = {
  // id,
  revId: {
    type: DataTypes.INTEGER,
    references: { model: Revision, key: "id" },
    // allowNull: false,
  },
  statusId: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    references: { model: Status, key: "id" },
  },
};

export const REV_ID_INTEGER_PK = {
  revId: {
    ...SeqIdCols.revId,
    primaryKey: true,
  },
};

export function err(msg: string) {
  throw new Error(msg);
}

export function has3WordChars(val: string) {
  if (!val.match(/\w{3,}/))
    err("must have at least 3 consecutive characters from [0-9a-zA-Z_]");
}
