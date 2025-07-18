import { DataTypes, Model, ModelAttributes } from "sequelize";

import {
  seqIdCols,
  seqInitOpts,
  REV_ID_INTEGER_PK,
  TIDs,
  TCrIDs,
  Status,
  Revision,
} from "./common";
import { has3ConsecutiveLetters } from "../utils";
import { Group } from "./group";

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<Category, TCategory> = {
  ...seqIdCols,
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
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
};

export type TCategory = TIDs & {
  groupId: number;
  name: string;
  description?: string;

  Revision?: Revision;
  Status?: Status;
  Group?: Group;

  current?: Category;
  archives?: CategoryArchive[];
};

export type TCrCategory = TCrIDs &
  Pick<TCategory, "name" | "description" | "groupId">;

class Common extends Model<TCategory, TCrCategory> {
  id!: number;
  revId!: number;
  statusId!: number;
  groupId!: number;

  name!: string;
  description?: string;

  Revision?: Revision;
  Status?: Status;
  Group?: Group;
}

export class Category extends Common {
  archives?: CategoryArchive[];
}

Category.init(COLS, {
  ...seqInitOpts,
  modelName: "Category",
});

export class CategoryArchive extends Common {
  current?: Category;
}

CategoryArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    modelName: "CategoryArchive",
    tableName: "categories_archive",
  }
);
