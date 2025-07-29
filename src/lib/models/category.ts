import { DataTypes, Model } from "sequelize";

import { seqInitOpts, TColSRI, Revision, seqCols } from "./common";
import { has3ConsecutiveLetters } from "../utils";
import { Group } from "./group";

export type TCategory = TColSRI & {
  groupId: number;
  name: string;
  description?: string;

  Revision?: Revision;
  Group?: Group;
};

export type TCrCategory = Partial<TColSRI> &
  Pick<TCategory, "name" | "description" | "groupId">;

export class Category extends Model<TCategory, TCrCategory> {
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

Category.init(
  {
    ...seqCols.SRI,

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
  },

  seqInitOpts("Category")
);
