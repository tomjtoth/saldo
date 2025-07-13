import { DateTime } from "luxon";

import { datetimeFromInt, datetimeToInt, EUROPE_HELSINKI } from "../utils";
import { Model } from "./model";
import { TUser } from "./user";

type TRevisionBase = {
  id: number;
  revisedOn: string;
  revisedBy: number;
};

export type TRevision = TRevisionBase & {
  User?: TUser;
};

export type TCrRevision = Pick<TRevisionBase, "revisedBy"> &
  Partial<Omit<TRevisionBase, "revisedBy">>;

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

    revisedOn: {
      type: "string",
      defaultValue: () => DateTime.local(EUROPE_HELSINKI).toISO(),
    },

    revisedBy: {
      type: "number",
      required: true,
    },
  },
  {
    toJS: (row) => ({
      ...row,
      revisedOn: datetimeFromInt(row.revisedOn)!,
    }),
    toDB: (obj) => ({
      ...obj,
      revisedOn: datetimeToInt(obj.revisedOn),
    }),
  }
);
