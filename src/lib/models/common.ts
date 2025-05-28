import { DataTypes, Model } from "sequelize";

import { db } from "./db";

export type TIDs = {
  id: number;
  revId: number;
  statusId: number;
};

export type TCrIDs = Partial<Omit<TIDs, "revId">> & Pick<TIDs, "revId">;

const id = {
  type: DataTypes.INTEGER,
  primaryKey: true,
  autoIncrement: true,
};

export const seqInitOpts = {
  sequelize: db,
  timestamps: false,
  underscored: true,
};

type TRevision = {
  id: number;
  revOn: number;
  revBy: number;
};

export type TCrRevision = Partial<Omit<TRevision, "revBy">> &
  Pick<TRevision, "revBy">;

export class Revision extends Model<TRevision, TCrRevision> {
  id!: number;
  revOn!: number;
  revBy!: number;
}

Revision.init(
  {
    id,
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
    ...seqInitOpts,
    modelName: "Revision",
  }
);

type TStatus = {
  id: number;
  description: string;
};

type TCrStatus = Pick<TStatus, "description">; //&Partial<Pick<TStatus, "id">>

export class Status extends Model<TStatus, TCrStatus> {
  id!: number;
  description!: string;
}
Status.init(
  {
    id,
    description: { type: DataTypes.TEXT, allowNull: false },
  },

  {
    ...seqInitOpts,
    modelName: "Status",
  }
);

export const SeqIdCols = {
  id,
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
