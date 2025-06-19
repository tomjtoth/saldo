import { DataTypes, Model, ModelAttributes } from "sequelize";
import { v4 as uuid } from "uuid";

import {
  REV_ID_INTEGER_PK,
  seqIdCols,
  seqInitOpts,
  TCrIDs,
  TIDs,
} from "./common";
import { has3ConsecutiveLetters } from "../utils";
import { User } from "./user";
import { Category } from "./category";
import { Membership } from "./membership";

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<Group, TGroup> = {
  ...seqIdCols,
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      has3ConsecutiveLetters,
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  uuid: {
    type: DataTypes.TEXT,
    defaultValue: uuid,
  },
};

export type TGroup = TIDs & {
  name: string;
  description?: string;
  uuid?: string | null;

  Users?: User[];
  Categories?: Category[];
  Memberships?: Membership[];
};

export type TCrGroup = TCrIDs & Pick<TGroup, "name" | "description">;

class Common extends Model<TGroup, TCrGroup> {
  id!: number;
  revId!: number;
  statusId!: number;

  name!: string;
  description?: string;
  uuid?: string | null;

  Users?: User[];
  Categories?: Category[];
  Memberships?: Membership[];
}

export class Group extends Common {}
Group.init(COLS, {
  ...seqInitOpts,
  modelName: "Group",
});

export class GroupArchive extends Common {}
GroupArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    modelName: "GroupArchive",
    tableName: "groups_archive",
  }
);
