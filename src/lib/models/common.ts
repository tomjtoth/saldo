import { DataTypes, Model } from "sequelize";

import { db } from "./db";
import { User } from "./user";

export type TIDs = {
  id: number;
  revId: number;
  statusId: number;
};

export type TCrIDs = Partial<TIDs>;

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

  User?: User;
}

Revision.init(
  {
    id,
    revOn: {
      type: DataTypes.INTEGER,
      defaultValue: () => Date.now(),
      get() {
        const rawValue = this.getDataValue("revOn");
        return new Date(rawValue).toLocaleString();
      },
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

export type TStatus = {
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

export const seqIdCols = {
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
    ...seqIdCols.revId,
    primaryKey: true,
  },
};
