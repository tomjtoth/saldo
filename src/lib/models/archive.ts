import { DataTypes, Model } from "sequelize";

import { seqCols, seqInitOpts, TColSRI } from "./common";

type Payload = number[] | string[] | { [key: string]: Payload };

export type TArchive = Omit<TColSRI, "statusId"> & {
  tableId: number;
  entityId1: number;
  entityId2?: number;
  payload: Payload;
};

export class Archive extends Model<TArchive> {
  id!: number;
  revId!: number;

  tableId!: number;
  entityId1!: number;
  entityId2?: number;
  payload!: Payload;
}

Archive.init(
  {
    ...seqCols.IR,

    tableId: { type: DataTypes.INTEGER, allowNull: false },
    entityId1: { type: DataTypes.INTEGER, allowNull: false },
    entityId2: { type: DataTypes.INTEGER },
    payload: { type: DataTypes.JSONB, allowNull: false },
  },

  seqInitOpts("Archive")
);
