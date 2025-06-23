import { DataTypes, Model, ModelAttributes } from "sequelize";

import { REV_ID_INTEGER_PK, seqIdCols, seqInitOpts } from "./common";
import { Category } from "./category";

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<Membership, TMembership> = {
  groupId: { type: DataTypes.INTEGER, primaryKey: true },
  userId: { type: DataTypes.INTEGER, primaryKey: true },
  revId: seqIdCols.revId,
  statusId: seqIdCols.statusId,
  defaultCatId: {
    type: DataTypes.INTEGER,
    references: { model: Category, key: "id" },
  },

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
  defaultCatId?: number;

  admin: boolean;

  current?: Membership;
  archives?: MembershipArchive[];
};

type TCrMembership = Pick<TMembership, "groupId" | "userId" | "revId"> &
  Partial<Pick<TMembership, "admin" | "statusId">>;

class Common extends Model<TMembership, TCrMembership> {
  groupId!: number;
  userId!: number;
  revId!: number;
  statusId!: number;
  defaultCatId?: number;

  admin!: boolean;

  current?: Membership;
  archives?: MembershipArchive[];
}

export class Membership extends Common {
  archives?: MembershipArchive[];
}
Membership.init(COLS, {
  ...seqInitOpts,
  modelName: "Membership",
});

export class MembershipArchive extends Common {}
MembershipArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    modelName: "MembershipArchive",
    tableName: "memberships_archive",
  }
);
