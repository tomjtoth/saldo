<<<<<<< HEAD
import { DataTypes, Model } from "sequelize";

import { seqInitOpts, TColSRI, Revision, seqCols } from "./common";
=======
>>>>>>> better-sqlite3
import { has3ConsecutiveLetters } from "../utils";
import { COL_SRI, Model, TCrModelSRI, TModelSRI } from "./model";
import { TRevision } from "./revision";

<<<<<<< HEAD
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
=======
type TCategoryBase = {
  groupId: number;
  name: string;
  description?: string;
};

export type TCategory = TModelSRI &
  TCategoryBase & {
    Revision?: TRevision;
    Archives?: TCategory[];
  };
export type TCrCategory = TCrModelSRI & TCategoryBase;

export const Categories = new Model<TCategory, TCrCategory>("categories", {
  ...COL_SRI,

  groupId: { type: "number", required: true },
  name: {
    type: "string",
    required: true,
    validators: [has3ConsecutiveLetters],
  },
});
>>>>>>> better-sqlite3
