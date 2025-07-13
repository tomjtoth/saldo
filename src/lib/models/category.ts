import { has3ConsecutiveLetters } from "../utils";
import { ModelSRI, TCrModelSRI, TModelSRI } from "./model";
import { TRevision } from "./revision";

type TCategoryBase = {
  groupId: number;
  name: string;
  description?: string;

  Revision?: TRevision;
  Archives?: TCategory[];
};

export type TCategory = TModelSRI & TCategoryBase;
export type TCrCategory = TCrModelSRI & TCategoryBase;

export const Categories = new ModelSRI<TCategory, TCrCategory>("categories", {
  groupId: { type: "number", required: true },
  name: {
    type: "string",
    required: true,
    validators: [has3ConsecutiveLetters],
  },
});
