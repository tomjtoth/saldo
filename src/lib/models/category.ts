import { DataTypes, Model, ModelAttributes } from "sequelize";

import {
  has3WordChars,
  SeqIdCols,
  seqInitOpts,
  REV_ID_INTEGER_PK,
  TIDs,
  TCrIDs,
} from "./common";

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

type TCategory = TIDs & { description: string };
export type TCrCategory = TCrIDs & Pick<TCategory, "description">;

export class Category extends Model<TCategory, TCrCategory> {
  id!: number;
  revId!: number;
  statusId!: number;

  description!: string;
}
Category.init(COLS, {
  ...seqInitOpts,
  tableName: "categories",
});

export class CategoryArchive extends Category {}
CategoryArchive.init(
  {
    ...COLS,
    ...REV_ID_INTEGER_PK,
  },
  {
    ...seqInitOpts,
    tableName: "categories_archive",
  }
);
