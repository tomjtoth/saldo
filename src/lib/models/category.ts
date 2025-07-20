import { has3ConsecutiveLetters } from "../utils";
import { COL_SRI, Model, TCrModelSRI, TModelSRI } from "./model";
import { TRevision } from "./revision";

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
