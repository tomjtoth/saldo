import { DataTypes, Model } from "sequelize";

import {
  has3WordChars,
  SeqIdCols,
  SeqInitOpts,
  REV_ID_INTEGER_PK,
  TIDs,
} from "./common";

export type TCategory = TIDs & { description: string };

/**
 * used in both Xy and XyArchive, but Archive additionally implements revId as PK
 */
const COLS = {
  ...SeqIdCols,
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      has3WordChars,
    },
  },
};

export class Category extends Model {}
Category.init(COLS, {
  ...SeqInitOpts,
  tableName: "categories",
});

export class CategoryArchive extends Model {}
CategoryArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...SeqInitOpts,
    tableName: "categories_archive",
  }
);
