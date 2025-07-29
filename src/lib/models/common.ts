import { DataTypes, Model, ModelAttributeColumnOptions } from "sequelize";

import { db } from "./db";
import { User } from "./user";
import { datetimeFromInt, datetimeToInt } from "../utils";

export type TColI = {
  id: number;
};

export type TColSR = {
  revId: number;
  statusId: number;
};

export type TColSRI = TColI & TColSR;

export type TCrIDs = Partial<TColSRI>;

type TRevision = {
  id: number;
  revOn: number;
  revBy: number;

  createdOn: string;
};

export type TCrRevision = Partial<Omit<TRevision, "revBy" | "revOn">> &
  Pick<TRevision, "revBy">;

export class Revision extends Model<TRevision, TCrRevision> {
  id!: number;
  revOn!: string;
  User?: User;
}

const id: ModelAttributeColumnOptions = {
  type: DataTypes.INTEGER,
  primaryKey: true,
  autoIncrement: true,
};

const revId: ModelAttributeColumnOptions = {
  type: DataTypes.INTEGER,
  references: { model: Revision, key: "id" },
};

const statusId: ModelAttributeColumnOptions = {
  type: DataTypes.INTEGER,
  defaultValue: 0,
};

export const seqCols = {
  I: { id },
  IR: { id, revId },
  SR: { statusId, revId },
  SRI: { statusId, revId, id },
};

export const seqInitOpts = (modelName: string) => ({
  modelName,
  sequelize: db,
  timestamps: false,
  underscored: true,
});

Revision.init(
  {
    ...seqCols.I,

    revOn: {
      type: DataTypes.BIGINT,
      field: "created_on",
      defaultValue: datetimeToInt,
    },

    createdOn: {
      type: DataTypes.VIRTUAL,
      get() {
        const rawValue = this.getDataValue("revOn");
        return datetimeFromInt(rawValue);
      },
    },

    revBy: {
      type: DataTypes.INTEGER,
      field: "created_by",
      references: { model: User, key: "id" },
    },
  },

  seqInitOpts("Revision")
);
