import { DataTypes, Model, ModelAttributes } from "sequelize";

import {
  SeqIdCols,
  seqInitOpts,
  REV_ID_INTEGER_PK,
  TIDs,
  TCrIDs,
  Status,
  Revision,
} from "./common";
import { has3WordChars } from "../utils";

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS: ModelAttributes<Category, TCategory> = {
  ...SeqIdCols,
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      has3WordChars,
    },
  },
};

export type TCategory = TIDs & {
  description: string;
  Status?: Status;
  Revision?: Revision;
  archives?: CategoryArchive[];
};

export type TCrCategory = TCrIDs & Pick<TCategory, "description">;

class Common extends Model<TCategory, TCrCategory> {
  id!: number;
  revId!: number;
  statusId!: number;
  description!: string;

  Status?: Status;
  Revision?: Revision;
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
