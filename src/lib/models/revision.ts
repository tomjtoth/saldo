import { DateTime } from "luxon";

import { datetimeFromInt, datetimeToInt, EUROPE_HELSINKI } from "../utils";
import { Model } from "./model";
import { TUser } from "./user";

export type TRevision = {
  id: number;
  revisedOn: string;
  revisedBy: number;

  User?: TUser;
};

export type TCrRevision = Pick<TRevision, "revisedBy"> &
  Partial<Omit<TRevision, "revisedBy">>;

type TDatabase = Omit<TRevision, "revisedOn"> & {
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
