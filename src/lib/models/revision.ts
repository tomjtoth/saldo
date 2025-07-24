import { DateTime } from "luxon";

import { datetimeFromInt, datetimeToInt, EUROPE_HELSINKI } from "../utils";
import { Model } from "./model";
import { TUser } from "./user";

type TRevisionBase = {
  id: number;
  createdOn: string;
  createdById: number;
};

export type TRevision = TRevisionBase & {
  createdBy?: TUser;
};

export type TCrRevision = Partial<TRevisionBase>;

type TDatabase = Omit<TRevisionBase, "revisedOn"> & {
  revisedOn: number;
};

export const Revisions = new Model<TRevision, TCrRevision, TDatabase>(
  "revisions",
  {
    id: {
      type: "number",
      primaryKey: true,
    },

    createdOn: {
      type: "string",
      defaultValue: () => DateTime.local(EUROPE_HELSINKI).toISO(),
      toJS: (fromDB) => datetimeFromInt(fromDB as number),
      toDB: (fromJS) => datetimeToInt(fromJS as string),
    },

    createdById: {
      type: "number",
      required: true,
    },
  }
);
