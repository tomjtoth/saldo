import { Updater } from "./updater";

export type { TCrModelSR, TCrModelSRI, TModelSR, TModelSRI } from "./types";

export const COL_SR = {
  revisionId: {
    type: "number" as const,
    required: true as const,
  },
  statusId: {
    type: "number" as const,
    defaultValue: 1,
  },
};

export const COL_SRI = {
  id: {
    type: "number" as const,
    primaryKey: true as const,
  },

  ...COL_SR,
};

export class Model<M, C, D = M> extends Updater<M, C, D> {}
