import {
  BelongsToGetAssociationMixin,
  DataTypes,
  Model,
  ModelAttributes,
} from "sequelize";

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

type TCategory = TIDs & { description: string };

export type TCliCategory = Omit<TCategory, "revId"> & {
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

  declare getStatus: BelongsToGetAssociationMixin<Status>;
  declare Status: Status;

  declare getRevision: BelongsToGetAssociationMixin<Revision>;
  declare Revision: Revision;
}

export class Category extends Common {
  declare getArchives: BelongsToGetAssociationMixin<CategoryArchive[]>;
  declare archives: CategoryArchive[];
}

Category.init(COLS, {
  ...seqInitOpts,
  modelName: "Category",
});

export class CategoryArchive extends Common {}
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
