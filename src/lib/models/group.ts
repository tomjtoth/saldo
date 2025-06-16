import { DataTypes, Model, ModelAttributes } from "sequelize";
import { v4 as uuid } from "uuid";

import { REV_ID_INTEGER_PK, SeqIdCols, seqInitOpts, TIDs } from "./common";
import { has3WordChars } from "../utils";
import { User } from "./user";
import { Category } from "./category";
import { Membership } from "./membership";

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<Group, TGroup> = {
  id: SeqIdCols.id,
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      has3WordChars,
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

export type TGroup = Pick<TIDs, "id"> & {
  name: string;
  description?: string;
  uuid?: string | null;

  Users?: User[];
  Categories?: Category[];
  Memberships?: Membership[];
};

export type TCrGroup = Pick<TGroup, "name" | "description"> &
  Partial<Pick<TGroup, "id" | "uuid">>;

class Common extends Model<TGroup, TCrGroup> {
  id!: number;
  name!: string;
  description?: string;
  uuid?: string;

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
