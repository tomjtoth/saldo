import { DataTypes, Model, ModelAttributes } from "sequelize";

import { seqInitOpts } from "./common";

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<Membership, TMembership> = {
  groupId: { type: DataTypes.INTEGER, primaryKey: true },
  userId: { type: DataTypes.INTEGER, primaryKey: true },
  admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
};

export type TMembership = {
  groupId: number;
  userId: number;
  admin: boolean;
};

type TCrMembership = Omit<TMembership, "admin"> &
  Partial<Pick<TMembership, "admin">>;

class Common extends Model<TMembership, TCrMembership> {
  groupId!: number;
  userId!: number;
  admin!: boolean;
}

export class Membership extends Common {}
Membership.init(COLS, {
  ...seqInitOpts,
  modelName: "Membership",
});
