import { DataTypes, Model, ModelAttributes } from "sequelize";

import { SeqIdCols, seqInitOpts } from "./common";

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<Membership, TMembership> = {
  groupId: { type: DataTypes.INTEGER, primaryKey: true },
  userId: { type: DataTypes.INTEGER, primaryKey: true },
  revId: SeqIdCols.revId,
  statusId: SeqIdCols.statusId,

  admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};

export type TMembership = {
  groupId: number;
  userId: number;
  revId: number;
  statusId: number;

  admin: boolean;
};

type TCrMembership = Pick<TMembership, "groupId" | "userId" | "revId"> &
  Partial<Pick<TMembership, "admin" | "statusId">>;

class Common extends Model<TMembership, TCrMembership> {
  groupId!: number;
  userId!: number;
  revId!: number;
  statusId!: number;

  admin!: boolean;
}

export class Membership extends Common {}
Membership.init(COLS, {
  ...seqInitOpts,
  modelName: "Membership",
});
